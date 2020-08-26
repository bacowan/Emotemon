var remote = require('electron').remote;
var fs = require('fs');
var path = require('path');
var url = require('url');
var BrowserWindow = require('electron').remote.BrowserWindow; 

const app = remote.app;
const appDataPath = app.getPath('userData');

function configure() {
    win = new BrowserWindow({
       width: 800,
       height: 600,
       webPreferences: {
          nodeIntegration: true
       }
    });
    win.setMenu(null);
    win.loadURL(url.format ({ 
       pathname: path.join(__dirname, 'configuration.html'), 
       protocol: 'file:', 
       slashes: true 
    }))
}