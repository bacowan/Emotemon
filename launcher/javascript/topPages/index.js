import { settingsFileName } from '../modules/constants.js';
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

      isConfigSetup = configuration != null
         && configuration.botName
         && configuration.oauth
         && configuration.channel
         && configuration.saveFilePath;
   }
   catch {
      isConfigSetup = false;
   }

   if (!isConfigSetup) {
      wizardPrompt();
   }
   else {
      window.location.href = 'running.html';
   }
}

function wizardPrompt() {
   const tooltip = document.getElementById('error-toast');
   tooltip.innerHTML = '';
   const textElement = document.createTextNode("Bot is not fully configured. Run the wizard?");
   tooltip.appendChild(textElement);
   const yesButton = document.createElement('button');
   yesButton.innerHTML = "Yes";
   tooltip.appendChild(yesButton);
   const noButton = document.createElement('button');
   noButton.innerHTML = "No";
   tooltip.appendChild(noButton);

   noButton.addEventListener(
      'click',
      () => tooltip.className = tooltip.className.replace(" show", ""));

   yesButton.addEventListener(
      'click',
      () => window.location.href = 'configWizard.html');

   tooltip.className += " show";
}

function setRunError(errorMessage) {
   const tooltip = document.getElementById('error-toast');
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