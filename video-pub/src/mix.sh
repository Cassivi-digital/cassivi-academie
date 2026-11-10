#!/bin/bash
# Mix final : voix traitée + musique duckée (sidechain) + sound design, master -14 LUFS / -1,5 dBTP
cd "$(dirname "$0")/.."
END=$(python3 -c "import json;print(json.load(open('build/cues.json'))['end'])")
FO=$(python3 -c "print($END-1.6)")
FC="[0:a]highpass=f=85,equalizer=f=220:t=q:w=1.2:g=-2,equalizer=f=3300:t=q:w=1.3:g=2.5,equalizer=f=10000:t=h:w=1:g=1.5,deesser=i=0.35,acompressor=threshold=-21dB:ratio=3.2:attack=6:release=140:makeup=4dB,pan=stereo|c0=c0|c1=c0,asplit=2[v][vk];\
[1:a]volume=0.24,afade=t=in:st=0:d=0.25,afade=t=out:st=$FO:d=1.6[m];\
[m][vk]sidechaincompress=threshold=0.035:ratio=4:attack=30:release=450:knee=4[md];\
[2:a]volume=0.72[s];\
[v][md][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:$END"
ffmpeg -y -v error -i audio/voice_edit.wav -i audio/music_edit.wav -i audio/sfx.wav -filter_complex "$FC" -ar 48000 build/mix_pre.wav
J=$(ffmpeg -v info -i build/mix_pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
gi(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i build/mix_pre.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(gi input_i):measured_TP=$(gi input_tp):measured_LRA=$(gi input_lra):measured_thresh=$(gi input_thresh):offset=$(gi target_offset):linear=true" -ar 48000 audio/mix_final.wav
ffmpeg -v info -i audio/mix_final.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tr -s ' ' | tr '\n' ' '; echo
