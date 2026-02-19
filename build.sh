#!/usr/bin/env bash
set -euo pipefail

MD_FILE="${1:-scripts/frames.md}"
if [[ ! -f "$MD_FILE" ]]; then
  echo "Error: '$MD_FILE' not found" >&2
  exit 1
fi

BASENAME=$(basename "$MD_FILE" .md)
OUTPUT_VIDEO="videos/${BASENAME}.mp4"

echo "Building from: $MD_FILE → $OUTPUT_VIDEO"

# Purge audio and images directories before every run
rm -rf ./audio/* 2>/dev/null || true
rm -rf ./images/* 2>/dev/null || true

node parse-frames.js "$MD_FILE" > frames.json
printf 'const FRAMES = %s;\n' "$(cat frames.json)" > frames.js
echo "Built frames.json and frames.js from $MD_FILE"
./generate_frames_js.sh
./build-images.sh
uv run python generate_voices.py
OUTPUT="$OUTPUT_VIDEO" ./make_video.sh
