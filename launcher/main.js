var {app, BrowserWindow, Menu} = require('electron') 
var url = require('url') 
var path = require('path')

function createWindow() {
   win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration: true
      }
   });
   win.setMenu(createMenu());
   loadUrl('html/index.html');
}

function loadUrl(urlToLoad) {
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, urlToLoad), 
      protocol: 'file:', 
      slashes: true 
   }))
}

function createMenu() {
   return Menu.buildFromTemplate([
      {
         label: 'File',
         submenu: [
            { label: 'Exit' }
         ]
      },
      {
         label: 'View',
         submenu: [
            {
               label: 'Logs',
               type: 'checkbox',
               checked: false
            },
            {
               label: 'Queue',
               type: 'checkbox',
               checked: false
            },
            {
               label: 'Developer Tools',
               click() { win.webContents.openDevTools() }
            }
         ]
      },
      {
         label: 'Help',
         submenu: [
            { label: 'Instructions' },
            { label: 'About' }
         ]
      }
   ])
}

app.allowRendererProcessReuse = false;
app.on('ready', createWindow)