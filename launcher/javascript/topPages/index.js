import { settingsFileName } from '../modules/constants.js';
import { getCacheLastUpdated } from '../modules/emoteCache.js';
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

async function runBot() {
   let isConfigSetup;
   try {
      const configurationFilePath = path.join(appDataPath, settingsFileName);
      await fs.promises.access(configurationFilePath);
      const configurationText = await fs.promises.readFile(configurationFilePath);
      const configuration = JSON.parse(configurationText);

      isConfigSetup = configuration.botName && configuration.oauth && configuration.channel;
   }
   catch {
      isConfigSetup = false;
   }

   if (!isConfigSetup) {
      setRunError("Bot is not fully configured");
   }
   else {
      const emoteCacheLastUpdated = await getCacheLastUpdated();
      if (emoteCacheLastUpdated == "never") {
         setRunError("Need to update the emote cache (through Configure");
      }
      else {
         window.location.href = 'running.html';
      }
   }
}

function setRunError(errorMessage) {
   const tooltip = document.getElementById('error-text');
   tooltip.innerHTML = errorMessage;
   tooltip.className += " show";
   setTimeout(
      () => tooltip.className = tooltip.className.replace(" show", ""),
      3000);
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