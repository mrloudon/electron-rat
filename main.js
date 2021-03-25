// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
// Need networkInterfaces to figure out the host IP
const { networkInterfaces } = require("os");
const express = require("express");
const path = require("path");
const PORT = 80;
let host;

const expressApp = express();

const status = {
    state: "Idle",
    currentShape: "circle",
    backgroundColor: "white",
    hidden: true,
    stopAnimation: true
};

let mainWindow, nPings = 0;

function getHostIP() {
    const nets = networkInterfaces();
    const IP_REG_EXP = /192\.168\.4\.[2-9]/;

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (IP_REG_EXP.test(net.address)) {
                    return net.address;
                }
            }
        }
    }
    return "127.0.0.1";
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        fullscreen: false,
        show: false,
        backgroundColor: "#eee",
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile("index.html");

    mainWindow.once("ready-to-show", () => {
        mainWindow.setMenuBarVisibility(false);
        mainWindow.show();
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on("activate", function () {
        // On macOS it"s common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

expressApp.use(express.static("public"));

expressApp.get("/tap", function (req, res) {
    res.send("Tap OK");
    mainWindow.webContents.send("tap", {
        x: req.query.x,
        y: req.query.y,
        time: req.query.t,
        stimulus: req.query.stim,
        success: req.query.hit
    });
    console.log(`X: ${req.query.x}, Y: ${req.query.y}, Success: ${req.query.hit}, Time: ${req.query.t}, Stimulus: ${req.query.stim}`);
});

expressApp.get("/status", function (req, res) {
    res.send(status);
    nPings++;
    mainWindow.webContents.send("ping", nPings);
});

expressApp.get("/reload", function (req, res) {
    nPings = 0;
    res.send("Reload OK");
});

function bindServer(){
    host = getHostIP();
    expressApp.listen(PORT, host, function () {
        console.log("Rat trainer app listening at http://%s:%s", host, PORT);
    });
}

ipcMain.on("black", () => status.backgroundColor = "black");
ipcMain.on("white", () => status.backgroundColor = "white");
ipcMain.on("circle", () => status.currentShape = "circle");
ipcMain.on("square", () => status.currentShape = "square");
ipcMain.on("star", () => status.currentShape = "star");
ipcMain.on("startAnimation", () => status.stopAnimation = false);
ipcMain.on("stopAnimation", () => status.stopAnimation = true);
ipcMain.on("show", () => status.hidden = false);
ipcMain.on("hide", () => status.hidden = true);

ipcMain.handle("host", async () => host);

bindServer();