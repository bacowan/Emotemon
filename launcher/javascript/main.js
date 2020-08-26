const {app, BrowserWindow, Menu} = require('electron') 
const url = require('url') 
const path = require('path')  

function createWindow() { 
   win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration: true
      }
   });
   //win.setMenu(createMenu());
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'index.html'), 
      protocol: 'file:', 
      slashes: true 
   })) 
}

function createMenu() {
   return Menu.buildFromTemplate([
      {
         label: 'File',
         submenu: [
            { label: 'Load Configuration' },
            { label: 'Save Configuration' },
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