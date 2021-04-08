// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
// Need networkInterfaces to figure out the host IP
const { networkInterfaces } = require("os");
const express = require("express");
const path = require("path");
const PORT = 80;
let host;
let clients = [];

const expressApp = express();

let mainWindow;

function getHostIP() {
    const nets = networkInterfaces();
    const IP_REG_EXP = /192\.168\.4\.[0-9]+/;

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
        height: 768,
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
        mainWindow.webContents.send("clients", clients.length);
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
    clients.forEach(client => {
        console.log("Closing:", client.id);
        sendCommand("close");
        client.res.end();
    });
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

expressApp.use(express.static("public"));

expressApp.get("/events", async function (req, res) {
    console.log('Got /events');
    res.set({
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache"
    });
    res.flushHeaders();
    res.write('retry: 10000\n\n');

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    }
    clients.push(newClient);
    console.log("Added new client", clientId);
    mainWindow.webContents.send("clients", clients.length);

    req.on("close", () => {
        console.log(`Connection to ${clientId} closed`);
        clients = clients.filter(client => client.id !== clientId);
        mainWindow.webContents.send("clients", clients.length);
    });
});

expressApp.get("/tap", function (req, res) {
    res.send("Tap OK");
    mainWindow.webContents.send("tap", {
        x: req.query.x,
        y: req.query.y,
        time: req.query.t,
        shape: req.query.sh,
        success: req.query.h,
        color: req.query.c,
        bgColor: req.query.b,
        size: req.query.sz,
        visible: req.query.v
    });
    console.log(`X: ${req.query.x}, Y: ${req.query.y}, Success: ${req.query.hit}, Time: ${req.query.t}, Stimulus: ${req.query.stim}`);
});

function bindServer() {
    host = getHostIP();
    expressApp.listen(PORT, host, function () {
        console.log("Rat trainer app listening at http://%s:%s", host, PORT);
    });
}

function sendCommand(command, value) {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ command, value })}\n\n`);
    });
}

ipcMain.on("background", (event, value) => {
    sendCommand("background", value);
});
ipcMain.on("foreground", (event, value) => {
    sendCommand("foreground", value);
});
ipcMain.on("circle", () => {
    sendCommand("circle");
});
ipcMain.on("star", () => {
    sendCommand("star");
});
ipcMain.on("startAnimation", () => {
    sendCommand("startAnimation");
});
ipcMain.on("stopAnimation", () => {
    sendCommand("stopAnimation");
});
ipcMain.on("show", () => {
    sendCommand("show");
});
ipcMain.on("hide", () => {
    sendCommand("hide");
});
ipcMain.on("green", () => {
    sendCommand("green");
});
ipcMain.on("grey", () => {
    sendCommand("grey");
});
ipcMain.on("small", () => {
    sendCommand("small");
});
ipcMain.on("large", () => {
    sendCommand("large");
});
ipcMain.on("left", () => {
    sendCommand("left");
});
ipcMain.on("right", () => {
    sendCommand("right");
});
ipcMain.on("center", () => {
    sendCommand("center");
});
ipcMain.on("reward", () => {
    sendCommand("reward");
});

ipcMain.handle("host", async () => host);

bindServer();