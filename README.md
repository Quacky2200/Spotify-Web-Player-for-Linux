![Spotify - Logged In](https://cloud.githubusercontent.com/assets/4623599/14404283/bd6f7d9c-fe69-11e5-9588-628248c25dfc.png)
# Spotify Web Player for Linux
#### Note: This is not the official Spotify application and is intended as a web application. This application could potentially become broken whenever Spotify update their Web Player layout. This was created as an alternative to their Spotify Application which was becoming out-dated until recently.
A Node.JS application built with electron to turn Spotify's Web Player into a local player for a stable Spotify Player for Linux replacement

## Includes
* Notifications 
* Tray Icon with Play, Previous, Next, Logout, and Quit functionality. 
* Non-intrusive Spotify advertisements (except Spotify playback advertisements). 
* D-Bus/MPRIS support
* Sing! A MusixMatch viewer integrated - sing your favourite songs from within the application
* Light theme
* Preferences - Customimize small things that can make a big difference
* Search bar linked to Ctrl+S
* Close To Tray (Minimize To Tray without the Tray Icon)

##Screenshots
![Notifications](https://cloud.githubusercontent.com/assets/4623599/17799657/39896b14-65d4-11e6-913a-14ae9f6fcc4d.png)
![Tray Icon](https://cloud.githubusercontent.com/assets/4623599/17799675/63a4c57e-65d4-11e6-8363-30a41ed7f67e.png)
![Controls in the Ubuntu Sound Menu](https://cloud.githubusercontent.com/assets/4623599/18234288/25695376-72f7-11e6-8ff8-b9409409008e.png)
![Non-intrustive Adverts](https://cloud.githubusercontent.com/assets/4623599/17799728/db82909e-65d4-11e6-98b3-ecccaf8de53a.png)
![Sing! A MusixMatch lyric integrated into the application](https://cloud.githubusercontent.com/assets/4623599/18258206/39226510-73c9-11e6-85c3-b58279fb88a1.png)
![Light theme](https://cloud.githubusercontent.com/assets/4623599/18234249/1b5d019e-72f6-11e6-835d-4b63a24eb920.png)
## How to install

Check out the [Releases](https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/releases) page.

#### If you cannot find a release, don't worry! It's easy to use with a few simple *linux only* commands...
##### Arch and other Linux users will need to make sure libappindicator-1 and libnotify4 (or alternative desktop environment packages) are installed that Electron will be able to use!
Debian/Ubuntu/Linux Mint
```
sudo apt-get install libappindicator-1 libnotify4 
```
Download the archive from GitHub
```
wget https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/archive/master.zip
```
Extract Spotify Web Player specifically like so:
```
sudo mkdir -p /usr/bin/spotifywebplayer/lib/electron && sudo unzip master.zip /usr/bin/spotifywebplayer
```
We must download a few prerequisites
```
cd /usr/bin/spotifywebplayer && . ./get_prerequisites.sh
```
Create Application Icon & Application Launcher
```
sudo cp /usr/bin/spotifywebplayer/spotify-large-transparent.png /usr/share/pixmaps/spotify-web-player.png && sudo echo "[Desktop Entry]\nVersion=0.9.4\nName=Spotify Web Player\nComment=Music for every moment. Spotify is a digital music service that gives you access to millions of songs.\nExec=bash /usr/bin/spotifywebplayer/spotifywebplayer\nPath=/usr/bin/spotifywebplayer\nIcon=spotify-web-player\nCategories=GNOME;GTK;AudioVideo;Audio;Player;\nActions=PlayPause;Next;Previous;\nType=Application\nTerminal=false\n[Desktop Action PlayPause]\nName=Play/Pause\nExec=dbus-send --print-reply --reply-timeout=2500 --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause\n[Desktop Action Next]\nName=Next\nExec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next\n[Desktop Action Previous]\nName=Previous\nExec=dbus-send --print-reply --session --dest=org.mpris.MediaPlayer2.spotifywebplayer /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous
```

## Requirements
libappindicator1, libnotify4, wget, unzip

Electron v1.3.4 can be found here: https://github.com/electron/electron/releases/v1.3.4
