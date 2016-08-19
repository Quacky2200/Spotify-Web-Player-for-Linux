#!/bin/sh
_DIR="$(dirname $(readlink -f $0))"

_ELECTRON="https://github.com/electron/electron/releases/download/v1.0.0/electron-v1.0.0-linux-ia32.zip"
_APP="spotifywebplayer"
_NAME="Spotify Web Player"
_EXEC="/usr/bin/$_APP/lib/electron/electron ."
_PATH="/usr/bin/$_APP"
_ICON="spotify-web-player"
_VERSION="0.8.19"
_AUTHOR="Matthew James"
_EMAIL="Quacky2200@hotmail.com"
_DESCRIPTION="Music for every moment. Spotify is a digital music service that gives you access to millions of songs."
_DEPS="libappindicator, libnotify4, notify-osd, wget, unzip"
_DESKTOP_EXTRAS="
Actions=Play;Pause;Next;Previous;
[Desktop Action Play]
Name=Play/Pause
Exec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause

[Desktop Action Next]
Name=Next
Exec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next

[Desktop Action Previous]
Name=Previous
Exec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous
"

_RELEASE_DIR="$_DIR/release/$_APP"
_BIN="$_RELEASE_DIR/usr/bin/$_APP"
_SHARE="$_RELEASE_DIR/usr/share"
_PIXMAPS="$_SHARE/pixmaps"
_APPLICATIONS="$_SHARE/applications"

#Make all directories for release 
mkdir -p $_RELEASE_DIR $_PIXMAPS $_BIN $_APPLICATIONS $_RELEASE_DIR/DEBIAN

#Copy spotify icon to pixbufs
cp "$_DIR/spotify-large-transparent.png" "$_PIXMAPS/$_ICON.png"

#Copy all code to /usr/bin/spotifywebplayer
cp -R $(ls $DIR | grep -v '^release$') $_BIN/

#Remove the lib folder
rm -rf $_BIN/lib

#Make a new .desktop file into applications
echo "[Desktop Entry]\nVersion=$_VERSION\nName=$_NAME\nComment=$_DESCRIPTION\nExec=$_EXEC\nPath=$_PATH\nIcon=$_ICON\nTerminal=false\nType=Application\nCategories=GNOME;GTK;AudioVideo;Audio;Player;\n$_DESKTOP_EXTRAS" > $_APPLICATIONS/$_APP.desktop

#Make .desktop file executable
chmod +x $_APPLICATIONS/$_APP.desktop
  
#Make the Debian package control file
_INSTALL_SIZE=$(du -s $_BIN | grep -o "^[0-9]\+")
echo "Package: $_APP\nVersion: $_VERSION\nSection: base\nPriority: optional\nArchitecture: i386\nInstalled-Size: $_INSTALL_SIZE\nMaintainer: $_AUTHOR <$_EMAIL>\nDescription: $_DESCRIPTION\n" > $_RELEASE_DIR/DEBIAN/control

#Make the Debian post installation script
echo "#!/bin/bash\nDIR=$_PATH/lib/electron/\nmkdir -p \$DIR\nTMPFILE='mktemp'\nPWD='pwd'\nwget '$_ELECTRON' -O \$TMPFILE\nunzip \$TMPFILE -d \$DIR\nrm \$TMPFILE" > $_RELEASE_DIR/DEBIAN/postinst

#Make the Debian post installation script
echo "#!/bin/bash\nkillall spotifywebplayer\nrm -rf /usr/bin/spotifywebplayer/lib" > $_RELEASE_DIR/DEBIAN/prerm


#Set permissions for the release
chmod 0755 $_RELEASE_DIR/DEBIAN/postinst
chmod 0755 $_RELEASE_DIR/DEBIAN/prerm
chmod 0644 $_RELEASE_DIR/DEBIAN/control

#Build the debian package
fakeroot dpkg-deb --build $_RELEASE_DIR

