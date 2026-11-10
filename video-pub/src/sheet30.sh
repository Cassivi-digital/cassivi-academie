#!/bin/bash
# sheet30.sh name W H cues t1 t2 ... -> build/s30_name.png
cd "$(dirname "$0")/.."
n=$1;w=$2;h=$3;c=$4;shift 4;d=build/prev30_$n;mkdir -p $d
NODE_PATH=$(npm root -g) node src/preview30.js $w $h $d/f $c "$@" && montage $d/f_*.png -tile ${COLS:-6}x -geometry x${TH:-480}+5+5 -background '#777' build/s30_$n.png && echo build/s30_$n.png
