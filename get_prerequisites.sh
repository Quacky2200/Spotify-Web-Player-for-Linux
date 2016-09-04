#!/bin/bash
#DIR="$(dirname $(readlink -f $0))"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bits=$(uname -m)
node_download_link=''
electron_download_link=''

case $bits in
	"i386"|"i686")
		node_download_link="https://nodejs.org/dist/v6.5.0/node-v6.5.0-linux-x86.tar.xz"
		electron_download_link="https://github.com/electron/electron/releases/download/v1.3.4/electron-v1.3.4-linux-ia32.zip"
		;;
	"x86_64")
		node_download_link="https://nodejs.org/dist/v6.5.0/node-v6.5.0-linux-x86.tar.xz"
		electron_download_link="https://github.com/electron/electron/releases/download/v1.3.4/electron-v1.3.4-linux-x64.zip"
		;;
	*)
		echo "unknown architecture - cannot proceed."
		exit 1
		;;
esac

echo \"Downloading application prerequisites...\"
LIB_DIR=$DIR/libs/
mkdir -p $LIB_DIR/electron
EL_TMPFILE="$(mktemp)"
ND_TMPFILE="$(mktemp)"
PWD="pwd"
wget "$electron_download_link" -O $EL_TMPFILE
wget "$node_download_link" -O $ND_TMPFILE
echo "Extracting Electron..."
unzip $EL_TMPFILE -d $LIB_DIR/electron
rm $EL_TMPFILE
echo "Renamed Electron for process name similarity"
mv $LIB_DIR/electron/electron $LIB_DIR/electron/spotifywebplayer
echo "Extracting Node.JS"
tar -xf $ND_TMPFILE -C $LIB_DIR
rm $ND_TMPFILE
mv $LIB_DIR/node* $LIB_DIR/node
echo "Finished! :)"
