![Spotify - Logged In](https://cloud.githubusercontent.com/assets/4623599/14404283/bd6f7d9c-fe69-11e5-9588-628248c25dfc.png)
# Spotify Web Player for Linux
#### Note: This is not the official Spotify application and is intended as a web application. This application could potentially become broken whenever Spotify update their Web Player layout. This was created as an alternative to their Spotify Application which was becoming out-dated until recently.
A Node.JS application built with electron to turn Spotify's Web Player into a local player for a stable Spotify Player for Linux replacement

## Includes
![Spotify - Notifications](https://cloud.githubusercontent.com/assets/4623599/17799657/39896b14-65d4-11e6-913a-14ae9f6fcc4d.png)
![Spotify - Tray Icon](https://cloud.githubusercontent.com/assets/4623599/17799675/63a4c57e-65d4-11e6-8363-30a41ed7f67e.png)
* Notifications 
* Tray Icon with Play, Previous, Next, Logout, Close to Tray and Quit functionality. 
* Non-intrusive Spotify advertisements (except Spotify playback advertisements). 
![Spotify - Non-intrustive Adverts](https://cloud.githubusercontent.com/assets/4623599/17799728/db82909e-65d4-11e6-98b3-ecccaf8de53a.png)

## How to install

Check out the [Releases](https://github.com/Quacky2200/Spotify-Web-Player-for-Linux/releases) page.

#### If you cannot find a release, don't worry! It's easy to use with a few simple commands...
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
Download Electron 1.0.0 and unzip it to the right directory
```
wget https://github.com/electron/electron/releases/download/v1.0.0/electron-v1.0.0-linux-ia32.zip && sudo unzip electron-v1.0.0-linux-ia32.zip /usr/bin/spotifywebplayer/lib/electron
```
Create Application Icon & Application Launcher
```
sudo cp /usr/bin/spotifywebplayer/spotify-large-transparent.png /usr/share/pixmaps/spotify-web-player.png && sudo echo "[Desktop Entry]\nVersion=0.8.19\nName=Spotify Web Player\nComment=Music for every moment. Spotify is a digital music service that gives you access to millions of songs.\nExec=/usr/bin/spotifywebplayer/lib/electron/electron .\nPath=/usr/bin/spotifywebplayer\nIcon=spotify-web-player\nTerminal=false\nType=Application\nCategories=GNOME;GTK;AudioVideo;Audio;Player;\n" > /usr/share/applications/spotifywebplayer.desktop && sudo chmod +x /usr/share/applications/spotifywebplayer.desktop
```

## Requirements
libappindicator1, libnotify4, wget, unzip

#### For development:
**(Optional)** Node.JS
Run with Node.JS using this command
```
node run.js
```
Run with Electron using this command
```
. /usr/bin/spotifywebplayer/spotifywebplayer
```
or
```
. /path/to/project/directory/spotifywebplayer
```
Electron v1.0.0 can be found here: https://github.com/electron/electron/releases/v1.0.0
