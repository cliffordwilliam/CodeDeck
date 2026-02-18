#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
FADE_DURATION=1        # seconds for crossfade transition
DEFAULT_DURATION=3     # fallback seconds when no audio file is found
WIDTH=1920
HEIGHT=1080
FPS=30
OUTPUT="output.mp4"
IMAGES_DIR="./images"
AUDIO_DIR="./audio"
AUDIO_SAMPLE_RATE=24000
# ─────────────────────────────────────────────────────────────────────────────

# Collect frames sorted numerically
mapfile -t FRAMES < <(find "$IMAGES_DIR" -maxdepth 1 -name "frame-*.png" | sort -V)

NUM_FRAMES=${#FRAMES[@]}

if [[ $NUM_FRAMES -eq 0 ]]; then
    echo "Error: no frames found in $IMAGES_DIR (expected frame-NNN.png)" >&2
    exit 1
fi

echo "Found $NUM_FRAMES frame(s)"
echo "Fade duration  : ${FADE_DURATION}s"

# ── Probe per-frame audio durations ──────────────────────────────────────────
DURATIONS=()
HAS_AUDIO=()

for (( i=0; i<NUM_FRAMES; i++ )); do
    AUDIO_FILE="$AUDIO_DIR/frame-$(printf '%03d' $i).wav"
    if [[ -f "$AUDIO_FILE" ]]; then
        DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_FILE")
        DURATIONS+=("$DUR")
        HAS_AUDIO+=(1)
        echo "Frame $i: audio ${DUR}s"
    else
        DURATIONS+=("$DEFAULT_DURATION")
        HAS_AUDIO+=(0)
        echo "Frame $i: no audio file, using ${DEFAULT_DURATION}s default"
    fi
done

# Shared scale/pad filter applied to every input stream
SCALE_PAD="scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS}"

# ── Single frame ─────────────────────────────────────────────────────────────
if [[ $NUM_FRAMES -eq 1 ]]; then
    echo "Single frame — duration ${DURATIONS[0]}s"
    if [[ "${HAS_AUDIO[0]}" -eq 1 ]]; then
        AUDIO_FILE="$AUDIO_DIR/frame-000.wav"
        ffmpeg -y \
            -loop 1 -t "${DURATIONS[0]}" -i "${FRAMES[0]}" \
            -i "$AUDIO_FILE" \
            -vf "$SCALE_PAD" \
            -c:v libx264 -pix_fmt yuv420p -r "$FPS" \
            -c:a aac -shortest \
            "$OUTPUT"
    else
        ffmpeg -y \
            -loop 1 -t "${DURATIONS[0]}" -i "${FRAMES[0]}" \
            -vf "$SCALE_PAD" \
            -c:v libx264 -pix_fmt yuv420p -r "$FPS" \
            -t "${DURATIONS[0]}" \
            "$OUTPUT"
    fi
    echo "Done. Output: $OUTPUT  (duration: ${DURATIONS[0]}s)"
    exit 0
fi

# ── Build ffmpeg inputs ───────────────────────────────────────────────────────
INPUT_ARGS=()

# Image inputs (indices 0..NUM_FRAMES-1).
# Each is extended by FADE_DURATION so that the intermediate xfade streams
# have enough data to cover the overlap period into the next transition.
for (( i=0; i<NUM_FRAMES; i++ )); do
    EXTENDED_DUR=$(echo "${DURATIONS[$i]} + $FADE_DURATION" | bc)
    INPUT_ARGS+=(-loop 1 -t "$EXTENDED_DUR" -i "${FRAMES[$i]}")
done

# Audio file inputs (appended after all image inputs)
AUDIO_INPUT_IDX=$NUM_FRAMES
AUDIO_INPUT_IDX_FOR_FRAME=()
for (( i=0; i<NUM_FRAMES; i++ )); do
    AUDIO_INPUT_IDX_FOR_FRAME[$i]=-1
done

for (( i=0; i<NUM_FRAMES; i++ )); do
    if [[ "${HAS_AUDIO[$i]}" -eq 1 ]]; then
        AUDIO_FILE="$AUDIO_DIR/frame-$(printf '%03d' $i).wav"
        INPUT_ARGS+=(-i "$AUDIO_FILE")
        AUDIO_INPUT_IDX_FOR_FRAME[$i]=$AUDIO_INPUT_IDX
        AUDIO_INPUT_IDX=$(( AUDIO_INPUT_IDX + 1 ))
    fi
done

# ── Build filtergraph ─────────────────────────────────────────────────────────
FILTER=""

# Scale/pad every video input stream: [0:v] → [v0], [1:v] → [v1], ...
for (( i=0; i<NUM_FRAMES; i++ )); do
    FILTER+="[$i:v]${SCALE_PAD}[v${i}];"
done

# Chain xfade filters with a running offset accumulator.
# The crossfade between frame k and k+1 must END exactly when audio k+1 starts,
# i.e. at sum(dur[0..k]). So the crossfade STARTS at sum(dur[0..k]) - FADE_DURATION.
#   offset[0] = dur[0] - FADE_DURATION
#   offset[k] = offset[k-1] + dur[k]   (accumulate the full previous duration)
running_offset=$(echo "${DURATIONS[0]} - $FADE_DURATION" | bc)

if [[ $NUM_FRAMES -eq 2 ]]; then
    FILTER+="[v0][v1]xfade=transition=fade:duration=${FADE_DURATION}:offset=${running_offset}[vout]"
else
    FILTER+="[v0][v1]xfade=transition=fade:duration=${FADE_DURATION}:offset=${running_offset}[xf1];"
    for (( k=2; k<NUM_FRAMES; k++ )); do
        running_offset=$(echo "$running_offset + ${DURATIONS[$((k-1))]}" | bc)
        PREV="xf$((k-1))"
        if [[ $k -eq $((NUM_FRAMES - 1)) ]]; then
            FILTER+="[${PREV}][v${k}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${running_offset}[vout]"
        else
            FILTER+="[${PREV}][v${k}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${running_offset}[xf${k}];"
        fi
    done
fi

# Audio: generate silence for frames without audio, pass through for frames with audio.
# Build labeled audio streams [a0]..[aN-1] then concat them.
AUDIO_CONCAT_INPUTS=""
for (( i=0; i<NUM_FRAMES; i++ )); do
    if [[ "${HAS_AUDIO[$i]}" -eq 1 ]]; then
        IDX=${AUDIO_INPUT_IDX_FOR_FRAME[$i]}
        FILTER+=";[${IDX}:a]anull[a${i}]"
        AUDIO_CONCAT_INPUTS+="[a${i}]"
    else
        FILTER+=";aevalsrc=0:s=${AUDIO_SAMPLE_RATE}:d=${DURATIONS[$i]}[a${i}]"
        AUDIO_CONCAT_INPUTS+="[a${i}]"
    fi
done
FILTER+=";${AUDIO_CONCAT_INPUTS}concat=n=${NUM_FRAMES}:v=0:a=1[aout]"

# Total duration = sum of all audio durations.
# The video naturally produces exactly this length once inputs are extended by
# FADE_DURATION and offsets are correct — no crossfade time needs to be subtracted.
TOTAL_DURATION=$(echo "${DURATIONS[*]}" | tr ' ' '+' | bc)

echo "Building filtergraph for $NUM_FRAMES frames..."
echo "Total output duration: ${TOTAL_DURATION}s"

ffmpeg -y \
    "${INPUT_ARGS[@]}" \
    -filter_complex "$FILTER" \
    -map "[vout]" \
    -map "[aout]" \
    -c:v libx264 -pix_fmt yuv420p -r "$FPS" \
    -c:a aac \
    -t "$TOTAL_DURATION" \
    "$OUTPUT"

echo "Done. Output: $OUTPUT  (duration: ${TOTAL_DURATION}s)"
