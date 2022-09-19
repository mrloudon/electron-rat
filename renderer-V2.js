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
const CLOCK_UPDATE = 100;
const INITIAL_BACKGROUND = 127;
const INITIAL_STIMULUS = 127;
const ACTIVE_BTN = "#FCF6CF";
const INACTIVE_BTN = "rgb(239,239,239)";
const ROUTER_URL = "http://192.168.4.1";
const PHASE_1_REWARD_TIME = 60000;
const PHASE_1_N_TRIALS = 30;
const PHASE_2_REWARD_TIME = 60000;
const PHASE_2_TIMEOUT_TIME = 15000;
const PHASE_2_MANUAL_TIME = 20000;
const DEBUG_REWARD_TIME = 1000;
const DEBUG_PHASE_2_TIMEOUT_TIME = 5000;
const DEBUG_PHASE_2_MANUAL_TIME = 2000;
const REWARD_BTN_DEAD_TIME = 5000;

const hostSpans = document.querySelectorAll(".host-span");
const clientsSpan = document.getElementById("clients-span");
const serverStatusSpan = document.getElementById("server-status-span");
const absoluteHmsSpan = document.getElementById("absolute-hms-span");
const absoluteSSpan = document.getElementById("absolute-s-span");
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

const nTD = document.getElementById("n-td");
const timeTD = document.getElementById("time-td");
const eventTD = document.getElementById("event-td");
const param1TD = document.getElementById("param-1-td");
const param2TD = document.getElementById("param-2-td");
const param3TD = document.getElementById("param-3-td");
const param4TD = document.getElementById("param-4-td");

let mode = "mode-3";
let currentTrial = 0;
let waitingForBreak = false;
let generalTimer, experimentTimer;

let experimentStartTime;
let eventCounter = 0;

function updateEventTable(eventName, param1 = "&#8212;", param2 = "&#8212;", param3 = "&#8212;", param4 = "&#8212;") {
    const timeStamp = (Date.now() - experimentStartTime) / 1000.0;
    eventCounter++;
    nTD.innerHTML = eventCounter;
    timeTD.innerHTML = timeStamp.toFixed(1);
    eventTD.innerHTML = eventName;
    param1TD.innerHTML = param1;
    param2TD.innerHTML = param2;
    param3TD.innerHTML = param3;
    param4TD.innerHTML = param4;
    if (param1 === "&#8212;") {
        param1 = "";
    }
    if (param2 === "&#8212;") {
        param2 = "";
    }
    if (param3 === "&#8212;") {
        param3 = "";
    }
    if (param4 === "&#8212;") {
        param4 = "";
    }
    ipc.send("write", `${eventCounter},${timeStamp.toFixed(1)},${eventName},${param1},${param2},${param3},${param4}`);
}

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

function experimentTimerTimeout() {

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
    const at = now - experimentStartTime;
    absoluteSSpan.innerHTML = Math.floor(Number(at / 1000));
    absoluteHmsSpan.innerHTML = msToTime(at);
}

ipc.on("tap", async (event, data) => {
    let status = "Unknown";

    if (data.success === "true" && data.visible === "visible") {
        status = "Success";
    }
    else if (data.success === "true" && data.visible === "hidden") {
        status = "Partial";
    }
    else {
        status = "Fail";
    }

    updateEventTable("Touch", `X = ${data.x}`, `Y = ${data.y}`, status);


    if (status === "Success") {
        switch (mode) {
            case "mode-2-automatic":
                clearTimeout(generalTimer); // Prevent auto trial
                mode = "mode-2-manual"; // We have a successful tap. Cease automatic, switch to manual.
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Phase 2", currentTrial, "Automatic");
                await fetch(`${ROUTER_URL}/b`);
                waitingForBreak = true;
                rewardBtn.innerHTML = "Reward";
                rewardBtn.disabled = false;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
            case "mode-2-manual":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Phase 2", currentTrial, "Manual");
                await fetch(`${ROUTER_URL}/b`);
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Waiting for IR break";
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
        console.log("Correct tap");
    }
});

//IR Break detected
ipc.on("udp", (event, data) => {

    updateEventTable("IR Break");
    console.log(`UDP: ${data}`);

    function handleMode1IRBreak() {
        const rewardTime = debugCB.checked ? 1000 : PHASE_1_REWARD_TIME;
        const nTrials = debugCB.checked ? 3 : PHASE_1_N_TRIALS;
        console.log(data);

        feedbackAlert.innerHTML = `Trial ${currentTrial}`;

        if (currentTrial === nTrials) {
            rewardBtn.disabled = false;
            feedbackAlert.innerHTML = "Phase 1<br> completed";
            clearTimeout(experimentTimer);
        }
        else {
            generalTimer = setTimeout(async () => {
                updateEventTable("Reward", "Phase 1", currentTrial);
                await fetch(`${ROUTER_URL}/b`);
                waitingForBreak = true;
                currentTrial++;
                feedbackAlert.innerHTML = `Trial ${currentTrial}`;
            }, rewardTime);
        }
    }

    function handleMode2AutomaticIRBreak() {
        feedbackAlert.innerHTML = "Automatic<br>Delay 60s";
        generalTimer = setTimeout(doPhase2AutomaticTrial, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_2_REWARD_TIME);
    }

    function handleMode2ManualIRBreak() {
        // Wait 60s do manual mode
        feedbackAlert.innerHTML = "Manual<br>Delay 60s";
        generalTimer = setTimeout(doPhase2ManualTrial, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_2_REWARD_TIME);
    }

    if (!waitingForBreak) {
        return;
    }

    waitingForBreak = false;

    switch (mode) {
        case "mode-1":
            handleMode1IRBreak();
            break;
        case "mode-2-automatic":
            handleMode2AutomaticIRBreak();
            break;
        case "mode-2-manual":
            handleMode2ManualIRBreak();
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

function doPhase2AutomaticTrial() {
    console.log("Phase 2 automatic trial");
    currentTrial++;
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Phase 2", "Automatic", currentTrial);
    feedbackAlert.innerHTML = `Automatic Trial<br>${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusAndReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Phase 2", "Automatic");
        updateEventTable("Reward", "Phase 2", "Automatic");
        await fetch(`${ROUTER_URL}/b`);
        waitingForBreak = true;
        feedbackAlert.innerHTML = "Waiting for IR break";
    }, debugCB.checked ? DEBUG_PHASE_2_TIMEOUT_TIME : PHASE_2_TIMEOUT_TIME);
}

function doPhase2ManualTrial() {
    console.log("Phase 2 manual trial");
    currentTrial++;
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Phase 2", "Manual", currentTrial);
    feedbackAlert.innerHTML = `Manual Trial<br>${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Phase 2", "Manual");
        feedbackAlert.innerHTML = "Manual Time Out";
        generalTimer = setTimeout(doPhase2ManualTrial,
            debugCB.checked ? DEBUG_PHASE_2_MANUAL_TIME : PHASE_2_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_PHASE_2_TIMEOUT_TIME : PHASE_2_TIMEOUT_TIME);
}

async function rewardBtnClick(event) {
    const target = event.currentTarget;
    switch (mode) {
        case "mode-1":
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            rewardBtn.disabled = true;
            currentTrial = 1;
            feedbackAlert.innerHTML = `Trial ${currentTrial}<br>Waiting for IR break`;
            updateEventTable("Reward", "Phase 1", currentTrial);
            await fetch(`${ROUTER_URL}/b`);

            waitingForBreak = true;
            break;
        case "mode-2-automatic":
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            rewardBtn.disabled = true;
            currentTrial = 0;
            waitingForBreak = false;
            doPhase2AutomaticTrial();
            break;
        case "mode-2-manual":
            clearTimeout(generalTimer);
            target.disabled = true;
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Phase 2", currentTrial, "Manual");
            await fetch(`${ROUTER_URL}/b`);
            waitingForBreak = true;
            setTimeout(() => target.disabled = false, REWARD_BTN_DEAD_TIME);
            feedbackAlert.innerHTML = "Waiting for IR break";
            break;
        case "mode-3":
            target.disabled = true;
            updateEventTable("Reward", "Phase 3", currentTrial);
            await fetch(`${ROUTER_URL}/b`);
            setTimeout(() => target.disabled = false, REWARD_BTN_DEAD_TIME);
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
    mode = "mode-2-automatic";
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
    console.log("Renderer V2 running.");
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
    experimentStartTime = Date.now();
}

initialise();

