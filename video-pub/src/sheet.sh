#!/bin/bash
# usage: sheet.sh name t1 t2 ... -> build/sheet_name.png
cd "$(dirname "$0")/.."
n=$1; shift; d=build/prev_$n; mkdir -p $d
NODE_PATH=$(npm root -g) node src/preview.js $d/f "$@" && montage $d/f_*.png -tile 5x -geometry 324x576+6+6 -background '#888' build/sheet_$n.png && echo build/sheet_$n.png
