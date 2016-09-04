const Menu = props.electron.Menu;
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Search',
        accelerator: 'CmdOrCtrl+S',
        visible: false,
        click: () => {
          $('#suggest-area').toggleClass('show');
          $($('.form-control'), $('iframe#suggest').contents()).focus();
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          tray.toggleTray(false);
          windowHook = false;
          props.electron.app.quit
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: (process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11'),
        click: () => {props.mainWindow.setFullScreen(!props.mainWindow.isFullScreen())}
      },
      {
        label: 'Preferences',
        click: () => {props.preferencesWindow.show();props.preferencesWindow.focus()}
      }
    ]
  },
  {
    label: 'Controls',
    submenu: [
      {label: 'Play/Pause', accelerator: 'MediaPlayPause', click: controller.playPause},
      {label: 'Next', accelerator: 'MediaNextTrack', click: controller.next},
      {label: 'Previous', accelerator: 'MediaPreviousTrack', click: controller.previous}
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [{label: 'About', click: () => {props.aboutWindow.show();props.aboutWindow.focus();}}]
  }
];
module.exports = Menu.buildFromTemplate(template);