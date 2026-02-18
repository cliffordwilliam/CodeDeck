#!/usr/bin/env bash
set -euo pipefail

node parse-frames.js frames.md > frames.json
printf 'const FRAMES = %s;\n' "$(cat frames.json)" > frames.js
echo "Built frames.json and frames.js from frames.md"
./generate_frames_js.sh
./build-images.sh
uv run python generate_voices.py
./make_video.sh
