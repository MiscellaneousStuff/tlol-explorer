const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

const loadMainWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width : 1200,
        height: 800,
        title: "TLoL-Explorer",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        frame: true
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.webContents.openDevTools()
}

app.on("ready", loadMainWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

ipcMain.on("close", (evt, arg) => {
    app.quit();
})

ipcMain.on("select-dir", () => {
    dir = dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"]
    });
});