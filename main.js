// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const express = require("express");
const path = require("path");

const PORT = 8080;
const IP = "192.168.0.3";
const server = express();

const status = {
    state: "running state"
};

let mainWindow;

function createWindow() {
    // Create the browser window.
        mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: false,
        show: false,
        backgroundColor: "#eee",
        // Don"t show the window until it"s ready, this prevents any white flickering
        // frame removes menubar and buttons. window.setMenu(null) remove menu only.
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // and load the index.html of the app.
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

server.use(express.static("public"));

server.get("/tap", function(req, res){
    console.log(`X: ${req.query.x}, Y: ${req.query.y}, Success: ${req.query.hit}, Time: ${req.query.t}, Stimulus: ${req.query.stim}`);
    res.send("OK");
    mainWindow.webContents.send("tap", `X: ${req.query.x}, Y: ${req.query.y}, Success: ${req.query.hit}, Time: ${req.query.t}, Stimulus: ${req.query.stim}`);
});

server.get("/status", function(req, res){
    res.send(status);
});

const serverInstance = server.listen(PORT, function () {
    //const host = server.address().address;
    const host = IP;
    const port = serverInstance.address().port;

    console.log("Example app listening at http://%s:%s", host, port);
});

ipcMain.on("black", () => status.state = "black");

ipcMain.on("white", () => status.state = "white");