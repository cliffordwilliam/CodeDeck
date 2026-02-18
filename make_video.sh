#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
FRAME_DURATION=3       # seconds each frame is displayed
FADE_DURATION=1        # seconds for crossfade transition
WIDTH=1920
HEIGHT=1080
FPS=30
OUTPUT="output.mp4"
IMAGES_DIR="./images"
# ─────────────────────────────────────────────────────────────────────────────

# Collect frames sorted numerically
mapfile -t FRAMES < <(find "$IMAGES_DIR" -maxdepth 1 -name "frame-*.png" | sort -V)

NUM_FRAMES=${#FRAMES[@]}

if [[ $NUM_FRAMES -eq 0 ]]; then
    echo "Error: no frames found in $IMAGES_DIR (expected frame-NNN.png)" >&2
    exit 1
fi

echo "Found $NUM_FRAMES frame(s)"
echo "Frame duration : ${FRAME_DURATION}s"
echo "Fade duration  : ${FADE_DURATION}s"

# Shared scale/pad filter applied to every input stream
SCALE_PAD="scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPS}"

# ── Single frame ─────────────────────────────────────────────────────────────
if [[ $NUM_FRAMES -eq 1 ]]; then
    echo "Single frame — looping for ${FRAME_DURATION}s"
    TOTAL_DURATION=$FRAME_DURATION
    ffmpeg -y \
        -loop 1 -t "$FRAME_DURATION" -i "${FRAMES[0]}" \
        -vf "$SCALE_PAD" \
        -c:v libx264 -pix_fmt yuv420p -r "$FPS" \
        -t "$FRAME_DURATION" \
        "$OUTPUT"
    echo "Done. Output: $OUTPUT  (duration: ${TOTAL_DURATION}s)"
    exit 0
fi

# ── Build ffmpeg inputs ───────────────────────────────────────────────────────
INPUT_ARGS=()
for frame in "${FRAMES[@]}"; do
    INPUT_ARGS+=(-loop 1 -t "$FRAME_DURATION" -i "$frame")
done

# ── Build filtergraph ─────────────────────────────────────────────────────────
# Label every input stream after scale/pad: [v0], [v1], ...
FILTER=""
for (( i=0; i<NUM_FRAMES; i++ )); do
    FILTER+="[$i:v]${SCALE_PAD}[v${i}];"
done

# Chain xfade filters
# offset for step k = k * (FRAME_DURATION - FADE_DURATION)
STEP=$(( FRAME_DURATION - FADE_DURATION ))

if [[ $NUM_FRAMES -eq 2 ]]; then
    FILTER+="[v0][v1]xfade=transition=fade:duration=${FADE_DURATION}:offset=${STEP}[vout]"
    LAST_LABEL="vout"
else
    # First xfade
    FILTER+="[v0][v1]xfade=transition=fade:duration=${FADE_DURATION}:offset=${STEP}[xf1];"
    for (( k=2; k<NUM_FRAMES; k++ )); do
        OFFSET=$(( k * STEP ))
        PREV="xf$(( k-1 ))"
        if [[ $k -eq $(( NUM_FRAMES - 1 )) ]]; then
            FILTER+="[${PREV}][v${k}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${OFFSET}[vout]"
            LAST_LABEL="vout"
        else
            FILTER+="[${PREV}][v${k}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${OFFSET}[xf${k}];"
        fi
    done
fi

# Total duration: N frames each shown for FRAME_DURATION, overlapping by FADE_DURATION at each join
TOTAL_DURATION=$(( NUM_FRAMES * FRAME_DURATION - (NUM_FRAMES - 1) * FADE_DURATION ))

echo "Building filtergraph for $NUM_FRAMES frames..."
echo "Total output duration: ${TOTAL_DURATION}s"

ffmpeg -y \
    "${INPUT_ARGS[@]}" \
    -filter_complex "$FILTER" \
    -map "[$LAST_LABEL]" \
    -c:v libx264 -pix_fmt yuv420p -r "$FPS" \
    -t "$TOTAL_DURATION" \
    "$OUTPUT"

echo "Done. Output: $OUTPUT  (duration: ${TOTAL_DURATION}s)"
