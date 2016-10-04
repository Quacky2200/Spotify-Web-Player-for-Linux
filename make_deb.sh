#!/bin/sh
bits=$1
DIR="$(dirname $(readlink -f $0))"
echo "Trying to build .deb for $bits"
debarch=""
flasharch=""
app="spotifywebplayer"
version="1.0.1"
author="Matthew James"
email="Quacky2200@hotmail.com"
app_path="/usr/bin/$app"
deps="libappindicator, libnotify4, notify-osd, wget, unzip, tar"
release_dir="$DIR/release/$app"
app_bin="$release_dir/usr/bin/$app"
app_share="$release_dir/usr/share"
app_pixmaps="$app_share/pixmaps"
app_share_execs="$app_share/applications"
description="Music for every moment. Spotify is a digital music service that gives you access to millions of songs. (unofficial client - see https://github.com/Quacky2200/Spotify-Web-Player-for-Linux for details)"
launcher="[Desktop Entry]
Name=Spotify Web Player
Comment=$description
Version=$version
Exec=bash /usr/bin/$app/$app
Path=/usr/bin/$app
Icon=spotify
Categories=GNOME;GTK;AudioVideo;Audio;Player;
Actions=PlayPause;Next;Previous;
Type=Application
Terminal=false

[Desktop Action PlayPause]
Name=Play/Pause
Exec=dbus-send --print-reply --reply-timeout=2500 --session --dest=org.mpris.MediaPlayer2.$app /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause

[Desktop Action Next]
Name=Next
Exec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.$app /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next

[Desktop Action Previous]
Name=Previous
Exec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.$app /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous
"

case $bits in
	"86"|"x86"|"32"|"ia32"|"i386"|"i686")
		echo "32Bit/x86 architecture recognised"
		debarch="i386"
		flasharch="ia32"
		;;
	"64"|"x64"|"amd_64"|"x86_64")
		echo "64Bit/x64 architecture recognised"
		debarch="amd64"
		flasharch="x64"
		;;
	*)
		echo "Specify architecture as an argument (./make_deb.sh 32)"
		exit 1
		;;
esac

echo "\nRemoving all library files from current directory - these are downloaded later!"
rm -rf $DIR/libs

echo "\nMake all temporary directories for release"
mkdir -p $release_dir/DEBIAN $app_pixmaps $app_bin $app_share_execs

echo "\nCopy Spotify icon to pixbufs"
cp $DIR/icons/spotify.png $app_pixmaps/

echo "\nCreate launcher (.desktop) into applications"
echo "$launcher" > $app_share_execs/$app.desktop

echo "\nMaking launcher executable"
chmod +x $app_share_execs/$app.desktop

echo "\nCopying important remaining files (except plugins, release folder, make_deb script and GitHub README.md)"
cp -R $(ls $DIR | grep -Ev "(plugins|release|make_deb\.sh|README\.md)$") $app_bin/

echo "\nCopying correct PepperFlash plugin"
mkdir $app_bin/plugins
cp $DIR/plugins/libpepflashplayer-$flasharch.so $app_bin/plugins

echo "\nMaking Debian CONTROL file"
install_size=$(du -s $app_bin | grep -o "^[0-9]\+") 
echo "Package: $app\nVersion: $version\nSection: base\nPriority: optional\nArchitecture: $debarch\nInstalled-Size: $install_size\nMaintainer: $author <$email>\nDescription: $description\n" > $release_dir/DEBIAN/control

echo "\nMaking Debian post install script"
postinstall="#!/bin/bash

cd /usr/bin/spotifywebplayer
. /usr/bin/spotifywebplayer/get_prerequisites.sh
" 
echo "$postinstall" > $release_dir/DEBIAN/postinst

echo "\nMaking the Debian pre-removal script"
prerm="#!/bin/bash
killall -q $app
rm -rf /usr/bin/$app/libs
"
echo "$prerm" > $release_dir/DEBIAN/prerm

echo "\nSetting Debian package permissions"
chmod 0755 $release_dir/DEBIAN/postinst $release_dir/DEBIAN/prerm
chmod 0644 $release_dir/DEBIAN/control

echo "\nBuilding Debian package file with fakeroot"
fakeroot dpkg --build $release_dir

echo "\nTidying up..."
rm -rf $DIR/release/$app
mv $DIR/release/$app.deb $DIR/release/$app$bits.deb
echo "$app$bits.deb build is complete!"
