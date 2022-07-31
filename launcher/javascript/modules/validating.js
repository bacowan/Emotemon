import { settingsFileName } from '../modules/constants.js';
import { isLuaScriptListening } from './emoteQueue.js';
const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');

const app = remote.app;
const appDataPath = app.getPath('userData');

async function validateSetup() {
    const setupController = createSetupModal();

    setupController.log("Checking configuration...");

    let isConfigSetup;
    try {
        const configurationFilePath = path.join(appDataPath, settingsFileName);
        await fs.promises.access(configurationFilePath);
        const configurationText = await fs.promises.readFile(configurationFilePath);
        const configuration = JSON.parse(configurationText);

        isConfigSetup = configuration != null
            && configuration.botName != null
            && configuration.oauth != null
            && configuration.channel != null
            && configuration.saveFilePath != null;
    }
    catch (e) {
        isConfigSetup = false;
    }

    if (!isConfigSetup) {
        setupController.log("Configuration is not set", true);
        return false;
    }
    else {
        setupController.log("Configuration set correctly");
    }

    let luaScriptDetected = false;
    while (!luaScriptDetected && !setupController.isClosed()) {
        setupController.log("Checking for lua script...");
        luaScriptDetected = await isLuaScriptListening();
        if (!luaScriptDetected) {
            setupController.log("Lua script could not be detected. Make sure that Pokemon FireRed is running in MGBA along with the Lua script.", true);
        }
    }

    const success = !setupController.isClosed();
    if (success) {
        setupController.close();
    }

    return success;
}

function createSetupModal() {
    const overlay = document.createElement("div");
    overlay.setAttribute(
        "style",
        "width: 100%; height: 100%; top: 0; position: fixed; left: 0; background: black; opacity: 50%;");
    document.body.appendChild(overlay);
    const modal = document.createElement("div");
    modal.setAttribute(
        "style",
        "background-color: #fefefe; padding: 20px; top: 50%; left: 50%; transform: translate(-50%, -50%); position: absolute;");
    document.body.appendChild(modal);
    const header = document.createElement("h3");
    header.innerHTML = "Validating setup...";
    header.setAttribute(
        "style",
        "color: black");
    modal.appendChild(header);
    const cancelButton = document.createElement("button");
    cancelButton.innerHTML = "Cancel";
    modal.appendChild(cancelButton);
    const messages = document.createElement("ul");
    messages.setAttribute("style", "max-height:15em; overflow-y:auto");
    modal.appendChild(messages);
    let closed = false;
    const close = e => {
        closed = true;
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    };
    cancelButton.addEventListener("click", close);
    return {
        log: function(message, isError = false) {
            const li = document.createElement("li");
            li.innerHTML = message;
            li.setAttribute(
                "style",
                "color: black");
            if (isError) {
                li.setAttribute("style", "color:red; font-weight:bold");
            }
            messages.appendChild(li);
        },
        close: close,
        isClosed: () => closed
    };
}

export { validateSetup }