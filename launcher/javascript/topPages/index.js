const remote = require('electron').remote;
const fs = require('fs');
const path = require('path');
const url = require('url');
const BrowserWindow = require('electron').remote.BrowserWindow; 

const app = remote.app;
const appDataPath = app.getPath('userData');

function configure() {
    const win = new BrowserWindow({
      width: 350,
      height: 675,
      webPreferences: {
         nodeIntegration: true
      }
    });
    //win.setMenu(null);
    win.loadURL(url.format ({ 
       pathname: path.join(__dirname, 'configuration.html'), 
       protocol: 'file:', 
       slashes: true 
    }));
}

function runBot() {
   window.location.href = 'running.html';
}

function help() {
   const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
         nodeIntegration: true
      }
   });
   //win.setMenu(null);
   win.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'help.html'), 
      protocol: 'file:', 
      slashes: true 
   }));
}

export { help, runBot, configure }