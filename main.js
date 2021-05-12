// electron entry

const electron = require('electron');

const { app, BrowserWindow } = electron;

let window = null;

app.on('ready', () => {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
  });
  // window.on('close', () => {
  //   window = null;
  // });
  window.loadURL('http://localhost:8080');
  // window.loadURL(`${app.getAppPath()}/dist/index.html`);

  window.show();
});
