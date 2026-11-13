#!/bin/bash
# Version finale (voix « Nicolas ») : rendu qualité maximale dans les 4 formats (+ version WhatsApp légère, miniatures).
# Chaîne : captures PNG sans perte -> intermédiaire RGB sans perte -> un seul encodage H.264 final (BT.709).
cd "$(dirname "$0")/.."; export PAGE=pub_final.html
CUES=build/cues_final.json; MIX=audio/mix_final_v.wav; OUT=export/version_finale; SEGD=build/seg_final; P=CASSIVI_MediaBuyer_Final
DUR=$(python3 -c "import json;print(json.load(open('$CUES'))['end'])")
TOTAL=$(python3 -c "import math;print(math.ceil($DUR*30))"); N=4; SEG=$(( (TOTAL+N-1)/N ))
mkdir -p $SEGD $OUT
CS="-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv"
VF="scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p"
for F in ${FORMATS:-"9x16:1080:1920" "4x5:1080:1350" "1x1:1080:1080" "16x9:1920:1080"}; do
  IFS=: read NAME W H <<< "$F"; export W H; : > $SEGD/list_$NAME.txt
  for i in $(seq 0 $((N-1))); do F0=$((i*SEG)); F1=$(( (i+1)*SEG )); [ $F1 -gt $TOTAL ] && F1=$TOTAL
    NODE_PATH=$(npm root -g) node src/render_hq_worker.js 30 $F0 $F1 $SEGD/${NAME}_$i.mkv $CUES &
    echo "file '${NAME}_$i.mkv'" >> $SEGD/list_$NAME.txt; done; wait
  ffmpeg -y -v error -f concat -safe 0 -i $SEGD/list_$NAME.txt -c copy $SEGD/${NAME}_master.mkv
  ffmpeg -y -v error -i $SEGD/${NAME}_master.mkv -i $MIX -map 0:v -map 1:a -vf "$VF" \
    -c:v libx264 -preset slower -crf 12 -profile:v high -level:v 4.1 -maxrate 40M -bufsize 60M -g 60 -x264-params aq-mode=3 $CS \
    -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart $OUT/${P}_$NAME.mp4
  ffmpeg -y -v error -i $SEGD/${NAME}_master.mkv -frames:v 1 -q:v 1 $OUT/miniature_$NAME.jpg
  echo "DONE $NAME $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -select_streams v -of csv=p=0 $OUT/${P}_$NAME.mp4)/$TOTAL images $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 $OUT/${P}_$NAME.mp4)"
done
if [ -f $SEGD/9x16_master.mkv ]; then
  ffmpeg -y -v error -i $SEGD/9x16_master.mkv -i $MIX -map 0:v -map 1:a \
    -vf "scale=720:1280:out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" \
    -c:v libx264 -preset slow -crf 22 -maxrate 3M -bufsize 6M -profile:v high -g 60 $CS -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart $OUT/${P}_WhatsApp.mp4
  echo "DONE WhatsApp $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 $OUT/${P}_WhatsApp.mp4)"
fi
echo ALLDONE
