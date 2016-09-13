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
          $($('.form-control'), $('iframe#suggest').contents()).click();
        }
      },
      {
        label: 'Logout',
        click: () => {
          user.logout();
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          tray.toggleTray(false);
          windowHook = false;
          props.electron.app.quit();
          props.process.exit(0);
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
let _menu;
module.exports = {
  toggleMenu: (toggle) => {
    if(toggle && !_menu){
      _menu = Menu.buildFromTemplate(template);
      props.electron.app.setApplicationMenu(_menu);
    } else if(!toggle && _menu){
      props.electron.app.setApplicationMenu(null);
      _menu = null;
    }
  }
}
 