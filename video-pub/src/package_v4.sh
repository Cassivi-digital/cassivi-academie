#!/bin/bash
# Encodage final v4 + organisation des livrables par placement
cd "$(dirname "$0")/.."
OUT=export/v4_premium; mkdir -p $OUT/01_video_principale $OUT/02_feed_4x5 $OUT/03_stories_9x16 $OUT/04_reels_9x16 $OUT/05_horizontal_16x9 $OUT/06_sources
enc(){ # master sortie
 ffmpeg -y -v error -i "$1" -i audio/mix_v4_final.wav -map 0:v -map 1:a \
  -vf "scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=tv:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level:v 4.1 -g 60 -keyint_min 60 -sc_threshold 0 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart "$2"; }
enc build/seg_v4/reels_master.mp4 $OUT/04_reels_9x16/CASSIVI_MediaBuyer_Reels_9x16_1080x1920.mp4
enc build/seg_v4/story_master.mp4 $OUT/03_stories_9x16/CASSIVI_MediaBuyer_Stories_9x16_1080x1920.mp4
enc build/seg_v4/feed_master.mp4  $OUT/02_feed_4x5/CASSIVI_MediaBuyer_Feed_4x5_1080x1350.mp4
enc build/seg_v4/wide_master.mp4  $OUT/05_horizontal_16x9/CASSIVI_MediaBuyer_Horizontal_16x9_1920x1080.mp4
cp $OUT/04_reels_9x16/CASSIVI_MediaBuyer_Reels_9x16_1080x1920.mp4 $OUT/01_video_principale/CASSIVI_MediaBuyer_Principale_9x16.mp4
for f in $OUT/0[1-5]*/*.mp4; do echo "$f | $(ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate,profile,color_space -of csv=p=0 $f) | $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 $f)"; done
