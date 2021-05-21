// electron entry

const electron = require('electron');

const { app, BrowserWindow, ipcMain } = electron;

let window = null;

app.on('ready', () => {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });

  // ipcMain 监听 ipcRender 通信
  ipcMain.on('window-min', () => {
    window.minimize();
  });
  ipcMain.on('window-close', () => {
    window.close();
  });

  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'dev') {
    window.loadURL('http://localhost:8080');
  } else {
    window.loadURL(`${app.getAppPath()}/dist/index.html`);
  }

  window.show();
});
