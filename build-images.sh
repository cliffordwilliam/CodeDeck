#!/usr/bin/env bash
set -e

if ! command -v firefox &>/dev/null; then
  echo "Error: firefox not found on PATH" >&2
  exit 1
fi

FRAME_COUNT=$(node -e "eval(require('fs').readFileSync('./frames.js','utf8').replace('const FRAMES','var FRAMES')); console.log(FRAMES.length)")

mkdir -p images

for i in $(seq 0 $((FRAME_COUNT - 1))); do
  FILENAME="frame-$(printf '%03d' $i).png"
  echo "[$(($i + 1))/$FRAME_COUNT] Capturing $FILENAME"
  firefox --headless --screenshot "$(pwd)/images/$FILENAME" --window-size=1920,1080 "file://$(pwd)/index.html?frame=$i"
done

echo "Done! $FRAME_COUNT frames saved to images/"
