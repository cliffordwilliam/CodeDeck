#!/usr/bin/env bash
set -e

printf 'const FRAMES = %s;\n' "$(cat frames.json)" > frames.js
echo "Generated frames.js from frames.json"
