const { remote } = require('@electron/remote');
const { BrowserWindow } = remote;

window.onload = () => {
    console.log("hi:", BrowserWindow);
}