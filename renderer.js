// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const ipc = require("electron").ipcRenderer;

//let startTime;

const timeTD = document.getElementById("time-td");
const xTD = document.getElementById("x-td");
const yTD = document.getElementById("y-td");
const successTD = document.getElementById("success-td");
const shapeTD = document.getElementById("shape-td");
const sizeTD = document.getElementById("size-td");
const colorTD = document.getElementById("color-td");
const backgroundTD = document.getElementById("background-td");
const visibleTD = document.getElementById("visible-td");
const hostSpan = document.getElementById("host-span");
const shapeBtns = document.querySelectorAll(".shape-btn");
const colorBtns = document.querySelectorAll(".color-btn");
const sizeBtns = document.querySelectorAll(".size-btn");
const backgroundBtns = document.querySelectorAll(".background-btn");
const visibilityBtns = document.querySelectorAll(".visibility-btn");
const animationBtns = document.querySelectorAll(".animation-btn");
const positionBtns = document.querySelectorAll(".position-btn");
const rewardBtn = document.getElementById("reward-btn");

ipc.on("tap", (event, data) => {
    console.log(data);
    timeTD.innerHTML = data.time.toString();
    xTD.innerHTML = data.x.toString();
    yTD.innerHTML = data.y.toString();
    successTD.innerHTML = data.success;
    shapeTD.innerHTML = data.shape;
    sizeTD.innerHTML = data.size;
    colorTD.innerHTML = data.color;
    backgroundTD.innerHTML = data.bgColor;
    visibleTD.innerHTML = data.visible;
});

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

function positionBtnClick(event) {
    for (const btn of positionBtns) {
        btn.style.backgroundColor = "rgb(239,239,239)";
    }
    event.currentTarget.style.backgroundColor = "#FCF6CF";
    console.log(event.currentTarget.innerText);
    switch (event.currentTarget.innerText) {
        case "Left":
            ipc.send("left");
            break;
        case "Right":
            ipc.send("right");
            break;
        case "Centre":
            ipc.send("center");
            break;
    }
}

function rewardBtnClick(event){
    ipc.send("reward");
    const target = event.currentTarget;
    target.disabled = true;
    setTimeout(() => target.disabled = false, 2000);
}

function attachListeners() {
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
    for (const btn of positionBtns) {
        btn.addEventListener("click", positionBtnClick);
    }
    rewardBtn.addEventListener("click", rewardBtnClick);
}

attachListeners();
ipc.invoke("host")
    .then(result => hostSpan.innerHTML = result);