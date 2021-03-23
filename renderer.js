// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const MILLIS_SEC = 1000;
const MILLIS_MIN = 1000 * 60;
const MILLIS_HR = 60 * MILLIS_MIN;
let startTime, clockTimer;

const timeSpan = document.getElementById("time-span");
const ipc = require("electron").ipcRenderer;

require("electron").ipcRenderer.on("tap", (event, message) => {
    document.getElementById("tap-span").innerHTML = message;
    console.log(message);
});

function showBtnClick(){
    ipc.send("show");
}

function hideBtnClick(){
    ipc.send("hide");
}

function blackBtnClick(){
    ipc.send("black");
}

function whiteBtnClick(){
    ipc.send("white");
}

function circleBtnClick(){
    ipc.send("circle");
}

function squareBtnClick(){
    ipc.send("square");
}

function starBtnClick(){
    ipc.send("star");
}

function startAnimationBtnClick(){
    ipc.send("startAnimation");
}

function stopAnimationBtnClick(){
    ipc.send("stopAnimation");
}

function stopBtnClick(){
    if(clockTimer){
        window.clearInterval(clockTimer);
        clockTimer = null;
    }
}

function startBtnClick(){
    if(clockTimer){
        window.clearInterval(clockTimer);
    }
    startTime = Date.now();
    clockTimer = setInterval(() => {
        let diff = Date.now() - startTime;
        let hours = Math.floor(diff / MILLIS_HR).toString();
        diff %= MILLIS_HR;
        let mins = Math.floor(diff / MILLIS_MIN).toString();
        diff %= MILLIS_MIN;
        let secs = Math.floor(diff / MILLIS_SEC).toString();
        diff %= MILLIS_SEC;
        if (hours.length < 2) {
            hours = "0" + hours;
        }
        if (mins.length < 2) {
            mins = "0" + mins;
        }
        if (secs.length < 2) {
            secs = "0" + secs;
        }
        timeSpan.innerHTML = `${hours}:${mins}:${secs}`;
    }, 1000);
}

function attachListeners(){
    document.getElementById("start-btn").addEventListener("click", startBtnClick);
    document.getElementById("stop-btn").addEventListener("click", stopBtnClick);
    document.getElementById("show-btn").addEventListener("click", showBtnClick);
    document.getElementById("hide-btn").addEventListener("click", hideBtnClick);
    document.getElementById("black-btn").addEventListener("click", blackBtnClick);
    document.getElementById("white-btn").addEventListener("click", whiteBtnClick);
    document.getElementById("circle-btn").addEventListener("click", circleBtnClick);
    document.getElementById("square-btn").addEventListener("click", squareBtnClick);
    document.getElementById("star-btn").addEventListener("click", starBtnClick);
    document.getElementById("start-animation-btn").addEventListener("click", startAnimationBtnClick);
    document.getElementById("stop-animation-btn").addEventListener("click", stopAnimationBtnClick);
}

attachListeners();