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
const timeTD = document.getElementById("time-td");
const xTD = document.getElementById("x-td");
const yTD = document.getElementById("y-td");
const successTD = document.getElementById("success-td");
const stimulusTD = document.getElementById("stimulus-td");
const hostSpan = document.getElementById("host-span");
const shapeBtns = document.querySelectorAll(".shape-btn");
const colorBtns = document.querySelectorAll(".color-btn");
const sizeBtns = document.querySelectorAll(".size-btn");
const ipc = require("electron").ipcRenderer;

ipc.on("tap", (event, data) => {
    timeTD.innerHTML = data.time.toString();
    xTD.innerHTML = data.x.toString();
    yTD.innerHTML = data.y.toString();
    successTD.innerHTML = data.success;
    stimulusTD.innerHTML = data.stimulus;
});

function showBtnClick() {
    ipc.send("show");
}

function hideBtnClick() {
    ipc.send("hide");
}

function blackBtnClick() {
    ipc.send("black");
}

function whiteBtnClick() {
    ipc.send("white");
}

function startAnimationBtnClick() {
    ipc.send("startAnimation");
}

function stopAnimationBtnClick() {
    ipc.send("stopAnimation");
}

function stopBtnClick() {
    if (clockTimer) {
        window.clearInterval(clockTimer);
        clockTimer = null;
    }
}

function startBtnClick() {
    if (clockTimer) {
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

function shapeBtnClick(event) {
    for (const btn of shapeBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    switch (event.currentTarget.innerText) {
        case "Square": ipc.send("square");
            break;
        case "Circle": ipc.send("circle");
            break;
        case "Star": ipc.send("star");
            break;
    }
}

function colorBtnClick(event) {
    for (const btn of colorBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    switch (event.currentTarget.innerText) {
        case "Green": ipc.send("green");
            break;
        case "Yellow": ipc.send("yellow");
            break;
        case "Blue": ipc.send("blue");
            break;
    }
}

function sizeBtnClick(event) {
    for (const btn of sizeBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    console.log(event.currentTarget.innerHTML);
}

function attachListeners() {
    document.getElementById("start-btn").addEventListener("click", startBtnClick);
    document.getElementById("stop-btn").addEventListener("click", stopBtnClick);
    document.getElementById("show-btn").addEventListener("click", showBtnClick);
    document.getElementById("hide-btn").addEventListener("click", hideBtnClick);
    document.getElementById("black-btn").addEventListener("click", blackBtnClick);
    document.getElementById("white-btn").addEventListener("click", whiteBtnClick);
    document.getElementById("start-animation-btn").addEventListener("click", startAnimationBtnClick);
    document.getElementById("stop-animation-btn").addEventListener("click", stopAnimationBtnClick);
    for (const btn of shapeBtns) {
        btn.addEventListener("click", shapeBtnClick);
    }
    for (const btn of colorBtns) {
        btn.addEventListener("click", colorBtnClick);
    }
    for (const btn of sizeBtns) {
        btn.addEventListener("click", sizeBtnClick);
    }
}

attachListeners();
ipc.invoke("host")
    .then(result => hostSpan.innerHTML = result);