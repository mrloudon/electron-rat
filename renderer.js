// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const MILLIS_SEC = 1000;
const MILLIS_MIN = 1000 * 60;
const MILLIS_HR = 60 * MILLIS_MIN;
const ipc = require("electron").ipcRenderer;

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
const backgroundBtns = document.querySelectorAll(".background-btn");
const visibilityBtns = document.querySelectorAll(".visibility-btn");
const animationBtns = document.querySelectorAll(".animation-btn");


ipc.on("tap", (event, data) => {
    timeTD.innerHTML = data.time.toString();
    xTD.innerHTML = data.x.toString();
    yTD.innerHTML = data.y.toString();
    successTD.innerHTML = data.success;
    stimulusTD.innerHTML = data.stimulus;
});


function hideBtnClick() {
    ipc.send("hide");
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
    switch (event.currentTarget.innerText) {
        case "Small": ipc.send("small");
            break;
        case "Large": ipc.send("large");
            break;
    }
}

function backgroundBtnClick(event) {
    for (const btn of backgroundBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    switch (event.currentTarget.innerText) {
        case "Black":
            ipc.send("bgBlack");
            break;
        case "White":
            ipc.send("bgWhite");
            break;
    }
}

function visibilityBtnClick(event) {
    for (const btn of visibilityBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    switch (event.currentTarget.innerText) {
        case "Show Stimulus":
            ipc.send("show");
            break;
        case "Hide Stimulus":
            ipc.send("hide");
            break;
    }
}

function animationBtnClick(event) {
    for (const btn of animationBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    console.log(event.currentTarget.innerText);
    switch (event.currentTarget.innerText) {
        case "Start":
            ipc.send("startAnimation");
            break;
        case "Stop":
            ipc.send("stopAnimation");
            break;
    }
}

function attachListeners() {
    document.getElementById("start-btn").addEventListener("click", startBtnClick);
    document.getElementById("hide-btn").addEventListener("click", hideBtnClick);
   
    for (const btn of shapeBtns) {
        btn.addEventListener("click", shapeBtnClick);
    }
    for (const btn of colorBtns) {
        btn.addEventListener("click", colorBtnClick);
    }
    for (const btn of sizeBtns) {
        btn.addEventListener("click", sizeBtnClick);
    }
    for (const btn of backgroundBtns) {
        btn.addEventListener("click", backgroundBtnClick);
    }
    for (const btn of visibilityBtns) {
        btn.addEventListener("click", visibilityBtnClick);
    }
    for (const btn of animationBtns) {
        btn.addEventListener("click", animationBtnClick);
    }
}

attachListeners();
ipc.invoke("host")
    .then(result => hostSpan.innerHTML = result);