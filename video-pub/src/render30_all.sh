#!/bin/bash
# Rend la version 30 s dans les 4 formats puis assemble l'audio
cd "$(dirname "$0")/.."
DUR=$(python3 -c "import json;print(json.load(open('build/cues30.json'))['end'])")
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*30))"); N=4; SEG=$(( (TOTAL+N-1)/N ))
mkdir -p build/seg30 export/version_30s
for F in "9x16 1080 1920" "4x5 1080 1350" "1x1 1080 1080" "16x9 1920 1080"; do
  set -- $F; NAME=$1; export W=$2 H=$3; : > build/seg30/list_$NAME.txt
  for i in $(seq 0 $((N-1))); do F0=$((i*SEG)); F1=$(( (i+1)*SEG )); [ $F1 -gt $TOTAL ] && F1=$TOTAL
    NODE_PATH=$(npm root -g) node src/render30_worker.js 30 $F0 $F1 build/seg30/${NAME}_$i.mp4 build/cues30.json &
    echo "file '${NAME}_$i.mp4'" >> build/seg30/list_$NAME.txt; done; wait
  ffmpeg -y -v error -f concat -safe 0 -i build/seg30/list_$NAME.txt -c copy build/seg30/${NAME}_master.mp4
  ffmpeg -y -v error -i build/seg30/${NAME}_master.mp4 -i audio/mix30_final.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -profile:v high -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart export/version_30s/CASSIVI_MediaBuyer_30s_$NAME.mp4
  echo "DONE $NAME $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 export/version_30s/CASSIVI_MediaBuyer_30s_$NAME.mp4)"
done
echo ALLDONE
