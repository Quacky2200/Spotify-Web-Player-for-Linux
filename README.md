![Spotify - Logged In](https://cloud.githubusercontent.com/assets/4623599/14404283/bd6f7d9c-fe69-11e5-9588-628248c25dfc.png)
# Spotify Web Player for Linux

[![Join the chat at https://gitter.im/SWP4L/Lobby](https://badges.gitter.im/SWP4L/Lobby.svg)](https://gitter.im/SWP4L/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
An Electron wrapper of Spotify Web Player to increase desktop integration for a stable Spotify Player for Linux replacement

## Functionality
* (D-Bus) Notifications 
* Tray Icon with Play, Previous, Next, Logout, and Quit functionality. 
* Non-intrusive Spotify advertisements (except Spotify playback advertisements). 
* D-Bus MPRIS controller support
* Sing! A MusixMatch viewer integrated - sing your favourite songs from within the application
* Light theme
* Preferences - Customimize small things that can make a big difference
* Search bar linked to Ctrl+S
* Close To Tray (Minimize To Tray without the Tray Icon)
* Update Button
* Remembers where you left off 
* Media Keys 
* Mix-&-Match tray icons to your DE/Icon preferences

##Screenshots
![Tray Icon](https://cloud.githubusercontent.com/assets/4623599/17799675/63a4c57e-65d4-11e6-8363-30a41ed7f67e.png)
![Controls in the Ubuntu Sound Menu](https://cloud.githubusercontent.com/assets/4623599/18899621/44c10b18-8532-11e6-9783-26756b511a6d.png)
![Notifications](https://cloud.githubusercontent.com/assets/4623599/18899796/8c8e62d2-8533-11e6-831a-38fae1b627ba.png)
![Non-intrustive Adverts](https://cloud.githubusercontent.com/assets/4623599/17799728/db82909e-65d4-11e6-98b3-ecccaf8de53a.png)
![Sing! A MusixMatch lyric integrated into the application](https://cloud.githubusercontent.com/assets/4623599/18258206/39226510-73c9-11e6-85c3-b58279fb88a1.png)
![Light theme](https://cloud.githubusercontent.com/assets/4623599/18234249/1b5d019e-72f6-11e6-835d-4b63a24eb920.png)
## How to install

Check out the [Releases](https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/releases) page.

#### If you cannot find a release, don't worry! It's easy to use with a few simple *linux only* commands...
##### Arch and other Linux users will need to make sure libappindicator-1 and libnotify4 (or alternative desktop environment packages) are installed that Electron will be able to use!
Debian/Ubuntu/Linux Mint
```
sudo apt-get install libappindicator1 libnotify4 
```
## Manual Install

**These commands require root priviledges (e.g. `sudo su`, `su root`)**

Make the appropriate directories
```
mkdir -p /usr/bin/spotifywebplayer/libs/electron && mkdir /usr/bin/spotifywebplayer/node_modules
```
Download the archive from GitHub
```
wget https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/archive/1.0.0.tar.gz
```
Extract Spotify Web Player
```
tar -zxvf 1.0.0.tar.gz --strip 1 -C /usr/bin/spotifywebplayer
```
We must download a few prerequisites
```
sh /usr/bin/spotifywebplayer/get_prerequisites.sh
```
If you are running 32 bit, we must get these modules
```
wget https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/releases/download/1.0.0/node_modules_x86.zip && unzip node_modules_x86.zip -d /usr/bin/spotifywebplayer/node_modules
```
However, if you're running 64 bit, we must get these modules
```
wget https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/releases/download/1.0.0/node_modules_x64.zip && unzip node_modules_x64.zip -d /usr/bin/spotifywebplayer/node_modules
```
Create Application Icon & Application Launcher
```
cp /usr/bin/spotifywebplayer/icons/spotify.png /usr/share/pixmaps/ && printf "[Desktop Entry]\nVersion=1.0.0\nName=Spotify Web Player\nComment=Music for every moment. Spotify is a digital music service that gives you access to millions of songs.\nExec=bash /usr/bin/spotifywebplayer/spotifywebplayer\nPath=/usr/bin/spotifywebplayer\nIcon=spotify\nCategories=GNOME;GTK;AudioVideo;Audio;Player;\nActions=PlayPause;Next;Previous;\nType=Application\nTerminal=false\n[Desktop Action PlayPause]\nName=Play/Pause\nExec=dbus-send --print-reply --reply-timeout=2500 --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause\n[Desktop Action Next]\nName=Next\nExec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next\n[Desktop Action Previous]\nName=Previous\nExec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous" > /usr/share/applications/spotifywebplayer.desktop
```
Make application launchable
```
chmod +x /usr/share/applications/spotifywebplayer.desktop && chmod +x /usr/bin/spotifywebplayer/spotifywebplayer
```
Launch the application with `gtk-launch spotifywebplayer` or `bash /usr/bin/spotifywebplayer/spotifywebplayer`

## Requirements
libappindicator1, libnotify4, wget, unzip, dbus
