// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const ipc = require("electron").ipcRenderer;

const MILLIS_SEC = 1000;
const MILLIS_MIN = 1000 * 60;
const MILLIS_HR = 60 * MILLIS_MIN;
const INITIAL_BACKGROUND = 127;
const INITIAL_STIMULUS = 127;
const ACTIVE_BTN = "#FCF6CF";
const INACTIVE_BTN = "rgb(239,239,239)";
const ROUTER_URL = "http://192.168.4.1";
const PHASE_1_REWARD_TIME = 60000;
const PHASE_1_N_TRIALS = 30;
const PHASE_2_REWARD_TIME = 60000;
const PHASE_2_TIMEOUT_TIME = 15000;
const PHASE_2_N_TRIALS = 30;
const DEBUG_N_TRIALS = 5;
const DEBUG_REWARD_TIME = 1000;
const DEBUG_PHASE_2_TIMEOUT_TIME = 3000;
const PHASE_1_CSV_HEADER = "Trial, Response Time, Start Time\n";
const PHASE_2_CSV_HEADER = "Trial,Time Out,Tap Time,IR Break Time\n";
//const PHASE_3_CSV_HEADER = `"Trial","Reponse","Absolute Trial Time","Absolute RespnseTime","Relative Response Time","X","Y","Success","Visable","Shape","Colour","Size","Position","Background Brightness","Foreground Brightness"\n`;


const trialTD = document.getElementById("trial-td");
const responseTD = document.getElementById("response-td");
const trialTimeTD = document.getElementById("trial-time-td");
const relativeTimeTD = document.getElementById("relative-time-td");
const absoluteTimeTD = document.getElementById("absolute-time-td");
const xTD = document.getElementById("x-td");
const yTD = document.getElementById("y-td");
const successTD = document.getElementById("success-td");
const shapeTD = document.getElementById("shape-td");
const sizeTD = document.getElementById("size-td");
const colorTD = document.getElementById("color-td");
const visibleTD = document.getElementById("visible-td");
const hostSpans = document.querySelectorAll(".host-span");
const clientsSpan = document.getElementById("clients-span");
const serverStatusSpan = document.getElementById("server-status-span");
const absoluteHmsSpan = document.getElementById("absolute-hms-span");
const absoluteSSpan = document.getElementById("absolute-s-span");
const relativeHmsSpan = document.getElementById("relative-hms-span");
const relativeSSpan = document.getElementById("relative-s-span");
const shapeBtns = document.querySelectorAll(".shape-btn");
const colorBtns = document.querySelectorAll(".color-btn");
const sizeBtns = document.querySelectorAll(".size-btn");
const visibilityBtns = document.querySelectorAll(".visibility-btn");
const animationBtns = document.querySelectorAll(".animation-btn");
const positionBtns = document.querySelectorAll(".position-btn");
const allRadioBtns = document.querySelectorAll(".radio-btn");
const rewardBtn = document.getElementById("reward-btn");
const fileBtn = document.getElementById("file-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const stimulusRange = document.getElementById("stimulusRange");
const stimulusRangeLabel = document.getElementById("stimulusRangeLabel");
const backgroundRange = document.getElementById("backgroundRange");
const backgroundRangeLabel = document.getElementById("backgroundRangeLabel");
const isiInput = document.getElementById("isi-ip");
const autoCB = document.getElementById("auto-cb");
const visibilityAlert = document.querySelector(".visibility-alert");
const feedbackAlert = document.querySelector(".col-feedback");
const modeRBs = document.querySelectorAll("input[name='mode-radios']");
const debugCB = document.getElementById("debug-checkbox");

let mode = "mode-3";
let currentTrial = 0;
let waitingForBreak = false;
let generalTimer, experimentTimer;
let phase2Data = {
    trial: 0,
    timeOut: 0,
    tapTime: 0,
    irBreakTime: 0
};

let experimentStartTime = 0, absoluteStartTime = 0, trialStartTime = 0;

function showVisible() {
    console.log("Show visible");
    visibilityBtns[0].style.backgroundColor = INACTIVE_BTN;
    visibilityBtns[1].style.backgroundColor = ACTIVE_BTN;
    visibilityAlert.innerHTML = "<h4>Stimulus Visible</h4>";
    visibilityAlert.style.backgroundColor = "#F6F9ED";
}

function showHidden() {
    console.log("Show hidden");
    visibilityBtns[0].style.backgroundColor = ACTIVE_BTN;
    visibilityBtns[1].style.backgroundColor = INACTIVE_BTN;
    visibilityAlert.innerHTML = "<h4>Stimulus Hidden</h4>";
    visibilityAlert.style.backgroundColor = "#FADBD8";
}

function experimentTimerTimeout(){

    function msToTime(diff) {
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
        return `${hours}:${mins}:${secs}`;
    }

    const now = Date.now();
    const at = now - absoluteStartTime;
    const rt = now - trialStartTime;

    absoluteSSpan.innerHTML = Math.floor(Number(at / 1000));
    absoluteHmsSpan.innerHTML = msToTime(at);
    relativeSSpan.innerHTML = Math.floor(Number(rt / 1000));
    relativeHmsSpan.innerHTML = msToTime(rt);
}

ipc.on("tap", async (event, data) => {
    const now = Date.now();
    trialTD.innerHTML = currentTrial;
    responseTD.innerHTML = data.response;
    xTD.innerHTML = data.x.toString();
    yTD.innerHTML = data.y.toString();
    successTD.innerHTML = data.success;
    shapeTD.innerHTML = data.shape;
    sizeTD.innerHTML = data.size;
    colorTD.innerHTML = data.color;
    visibleTD.innerHTML = data.visible;
    if (data.success === "true" && data.visible === "visible") {
        switch (mode) {
            case "mode-2":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                await fetch(`${ROUTER_URL}/b`);
                waitingForBreak = true;
                phase2Data.tapTime = now - trialStartTime;
                phase2Data.timeOut = 0;
                feedbackAlert.innerHTML = `Trial ${currentTrial}<br>${phase2Data.tapTime}`;
                break;
            case "mode-3":
                ipc.send("hide");
                showHidden();
                await fetch(`${ROUTER_URL}/b`);
                if (autoCB.checked) {
                    console.log("Starting ISI timer");
                    setTimeout(() => {
                        ipc.send("show");
                        showVisible();
                    }, Number(isiInput.value) * 1000);
                }
                break;
        }
        showHidden(); // Successful tap hides the stimulus
        console.log("Correct tap");
    }
});

ipc.on("udp", (event, data) => {

    function handleMode1() {
        const rewardTime = debugCB.checked ? 1000 : PHASE_1_REWARD_TIME;
        const nTrials = debugCB.checked ? 5 : PHASE_1_N_TRIALS;
        console.log(data);
        feedbackAlert.innerHTML = `Trial ${currentTrial}<br>RT: ${data}`;
        if (currentTrial === 1) {
            ipc.send("write", PHASE_1_CSV_HEADER + `${currentTrial},${data},${absoluteStartTime}\n`);
        }
        else {
            ipc.send("write", `${currentTrial},${data},${absoluteStartTime}\n`);
        }
        if (currentTrial === nTrials) {
            rewardBtn.disabled = false;
            feedbackAlert.innerHTML = "Phase 1<br> completed";
            clearTimeout(experimentTimer);
        }
        else {
            generalTimer = setTimeout(async () => {
                await fetch(`${ROUTER_URL}/b`);
                absoluteStartTime = Date.now() - experimentStartTime;
                waitingForBreak = true;
                currentTrial++;
                feedbackAlert.innerHTML = `Trial ${currentTrial}`;
            }, rewardTime);
        }
    }

    function handleMode2() {
        const nTrials = debugCB.checked ? DEBUG_N_TRIALS : PHASE_2_N_TRIALS;
        phase2Data.irBreakTime = data;
        const csv = `${phase2Data.trial},${phase2Data.timeOut},${phase2Data.tapTime},${phase2Data.irBreakTime}\n`;

        currentTrial++;
        if (currentTrial > nTrials) {
            rewardBtn.disabled = false;
            feedbackAlert.innerHTML = "Phase 2<br> completed";
            clearTimeout(experimentTimer);
        }
        else {
            generalTimer = setTimeout(beginPhase2Trial, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_2_REWARD_TIME);
            feedbackAlert.innerHTML = `Trial ${currentTrial}<br>RT: ${data}`;
        }
        if (phase2Data.trial === 1) {
            ipc.send("write", `${PHASE_2_CSV_HEADER}${csv}`);
        }
        else {
            ipc.send("write", csv);
        }
    }

    if (!waitingForBreak) {
        return;
    }

    waitingForBreak = false;

    switch (mode) {
        case "mode-1":
            handleMode1();
            break;
        case "mode-2":
            handleMode2();
            break;
    }

});

function shapeBtnClick(event) {
    for (const btn of shapeBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    switch (event.currentTarget.innerText) {
        case "Circle": ipc.send("circle");
            break;
        case "Star": ipc.send("star");
            break;
        case "Block": ipc.send("block");
            break;
    }
}

function colorBtnClick(event) {
    for (const btn of colorBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    switch (event.currentTarget.innerText) {
        case "Green": ipc.send("green");
            break;
        case "Grey": ipc.send("grey");
            break;
    }
}

function sizeBtnClick(event) {
    for (const btn of sizeBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    switch (event.currentTarget.innerText) {
        case "Small": ipc.send("small");
            break;
        case "Large": ipc.send("large");
            break;
    }
}

function visibilityBtnClick(event) {
    for (const btn of visibilityBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    switch (event.currentTarget.innerText) {
        case "Show Stimulus":
            ipc.send("show");
            showVisible();
            break;
        case "Hide Stimulus":
            ipc.send("hide");
            showHidden();
            break;
    }
}

function animationBtnClick(event) {
    for (const btn of animationBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
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
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
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

function disconnectBtnClick(event) {
    ipc.send("disconnect");
    const target = event.currentTarget;
    target.disabled = true;
    setTimeout(() => target.disabled = false, 1000);
    resetUI();
}

function fileBtnClick() {
    fileBtn.disabled = true;
    ipc.invoke("fName")
        .then(result => {
            document.getElementById("file-span").innerHTML = result;
            fileBtn.disabled = false;
        });
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
    fileBtn.addEventListener("click", fileBtnClick);
    disconnectBtn.addEventListener("click", disconnectBtnClick);
    stimulusRange.oninput = function () {
        ipc.send("foreground", this.value);
        stimulusRangeLabel.innerHTML = this.value;
    };
    backgroundRange.oninput = function () {
        ipc.send("background", this.value);
        backgroundRangeLabel.innerHTML = this.value;
    };
}

function beginPhase2Trial() {
    phase2Data.trial = currentTrial;
    ipc.send("show");
    showVisible();
    trialStartTime = Date.now();
    /** The first trial has an automatic reward subsequent trials require a successful tap */
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusAndReward() {
        ipc.send("hide");
        showHidden();
        await fetch(`${ROUTER_URL}/b`);
        waitingForBreak = true;
        phase2Data.timeOut = 1;
        phase2Data.tapTime = 0;
        feedbackAlert.innerHTML = `Trial ${currentTrial}<br>Time Out`;
        responseTD.innerHTML = "&mdash;";
        trialTimeTD.innerHTML = "&mdash;";
        relativeTimeTD.innerHTML = "&mdash;";
        absoluteTimeTD.innerHTML = "&mdash;";
        xTD.innerHTML = "&mdash;";
        yTD.innerHTML = "&mdash;";
        successTD.innerHTML = "&mdash;";
        shapeTD.innerHTML = "&mdash;";
        sizeTD.innerHTML = "&mdash;";
        colorTD.innerHTML = "&mdash;";
        visibleTD.innerHTML = "&mdash;";
    }, debugCB.checked ? DEBUG_PHASE_2_TIMEOUT_TIME : PHASE_2_TIMEOUT_TIME);
}

async function rewardBtnClick(event) {
    const target = event.currentTarget;
    switch (mode) {
        case "mode-1":
            rewardBtn.disabled = true;
            currentTrial = 1;
            feedbackAlert.innerHTML = `Trial ${currentTrial}`;
            await fetch(`${ROUTER_URL}/b`);
            experimentStartTime = Date.now();
            absoluteStartTime = 0;
            waitingForBreak = true;
            break;
        case "mode-2":
            rewardBtn.disabled = true;
            currentTrial = 1;
            waitingForBreak = false;
            absoluteStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, 1000);
            beginPhase2Trial();
            break;
        case "mode-3":
            target.disabled = true;
            await fetch(`${ROUTER_URL}/b`);
            setTimeout(() => target.disabled = false, 2000);
            break;
    }
}

function modeClick(evt) {
    clearTimeout(generalTimer);
    clearTimeout(experimentTimer);
    waitingForBreak = false;
    switch (evt.currentTarget.value) {
        case "1": mode1();
            break;
        case "2": mode2();
            break;
        case "3": mode3();
            break;
    }
}

function mode12DisableButtons() {
    document.getElementById("main-page").querySelectorAll("button").forEach(item => item.disabled = true);
    stimulusRange.disabled = true;
    backgroundRange.disabled = true;
    rewardBtn.disabled = false;
    fileBtn.disabled = false;
}

function mode1() {
    mode = "mode-1";
    rewardBtn.innerHTML = "Start";
    mode12DisableButtons();
}

function mode2() {
    mode = "mode-2";
    rewardBtn.innerHTML = "Start";
    mode12DisableButtons();
}

function mode3() {
    mode = "mode-3";
    rewardBtn.innerHTML = "Reward";
    document.getElementById("main-page").querySelectorAll("button").forEach(item => item.disabled = false);
    stimulusRange.disabled = false;
    backgroundRange.disabled = false;
}

function resetUI() {
    const defaultBtns = document.querySelectorAll(".default-btn");
    backgroundRange.value = INITIAL_BACKGROUND;
    stimulusRange.value = INITIAL_STIMULUS;
    backgroundRangeLabel.innerHTML = INITIAL_BACKGROUND;
    stimulusRangeLabel.innerHTML = INITIAL_STIMULUS;
    for (const btn of allRadioBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    defaultBtns.forEach(btn => btn.style.backgroundColor = ACTIVE_BTN);
    showHidden();
}

function initialise() {
    attachListeners();
    resetUI();
    ipc.on("clients", (event, data) => {
        console.log(data);
        clientsSpan.innerHTML = data.nClients;
        serverStatusSpan.innerHTML = data.message;
        resetUI();
    });
    ipc.invoke("host")
        .then(result => {
            hostSpans.forEach(item => item.innerHTML = result);
        });
    modeRBs.forEach(item => item.addEventListener("click", modeClick));

    /*  clockTimer = setInterval(() => {
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
         absoluteHmsSpan.innerHTML = `${hours}:${mins}:${secs}`;
     }, 1000); */

}

initialise();

