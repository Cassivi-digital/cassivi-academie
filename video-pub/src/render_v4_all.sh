#!/bin/bash
# Rend la v4 dans les 4 placements Meta puis assemble l'audio (H.264 High, AAC, BT.709)
cd "$(dirname "$0")/.."; export PAGE=pub_v4.html
DUR=$(python3 -c "import json;print(json.load(open('build/cues_v4.json'))['end'])")
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*30))"); N=4; SEG=$(( (TOTAL+N-1)/N ))
mkdir -p build/seg_v4
for F in "reels 1080 1920" "story 1080 1920" "feed 1080 1350" "wide 1920 1080"; do
  set -- $F; NAME=$1; export VARIANT=$1 W=$2 H=$3; : > build/seg_v4/list_$NAME.txt
  for i in $(seq 0 $((N-1))); do F0=$((i*SEG)); F1=$(( (i+1)*SEG )); [ $F1 -gt $TOTAL ] && F1=$TOTAL
    NODE_PATH=$(npm root -g) node src/render30_worker.js 30 $F0 $F1 build/seg_v4/${NAME}_$i.mp4 build/cues_v4.json &
    echo "file '${NAME}_$i.mp4'" >> build/seg_v4/list_$NAME.txt; done; wait
  ffmpeg -y -v error -f concat -safe 0 -i build/seg_v4/list_$NAME.txt -c copy build/seg_v4/${NAME}_master.mp4
  echo "DONE $NAME"
done
echo ALLDONE
