const { ipcRenderer } = require("electron");

const $ = id => { return document.getElementById(id) }

window.onload = () => {
    $("top-close").addEventListener("click", () => {
        console.log("close");
        ipcRenderer.send("close");
    });
};