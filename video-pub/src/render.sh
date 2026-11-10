#!/bin/bash
# usage: render.sh <duration_s> <out.mp4> [cues.json] [workers]
cd "$(dirname "$0")/.."
DUR=$1; OUT=$2; CUES=${3:-}; N=${4:-4}; FPS=30
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*$FPS))")
SEG=$(( (TOTAL + N - 1) / N )); mkdir -p build/seg; : > build/seg/list.txt
for i in $(seq 0 $((N-1))); do
  F0=$((i*SEG)); F1=$(( (i+1)*SEG )); [ $F1 -gt $TOTAL ] && F1=$TOTAL
  NODE_PATH=$(npm root -g) node src/render_worker.js $FPS $F0 $F1 build/seg/part$i.mp4 $CUES &
  echo "file 'part$i.mp4'" >> build/seg/list.txt
done
wait
ffmpeg -y -v error -f concat -safe 0 -i build/seg/list.txt -c copy "$OUT" && ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
