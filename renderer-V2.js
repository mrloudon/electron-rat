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
const PHASE_3_REWARD_TIME = 60000;
const PHASE_3_TIMEOUT_TIME = 15000;
const PHASE_3_MANUAL_TIME = 20000;
const MONOTONY_TIMEOUT_TIME = 15000;
const MONOTONY_MANUAL_TIME = 20000;
const MONOTONY_REWARD_TIME = 60000;
const VARIATION_TIMEOUT_TIME = 15000;
const VARIATION_MANUAL_TIME = 20000;
const VARIATION_REWARD_TIME = 60000;
const DEBUG_REWARD_TIME = 1000;
const DEBUG_PHASE_2_TIMEOUT_TIME = 5000;
const DEBUG_PHASE_2_MANUAL_TIME = 2000;
const DEBUG_PHASE_3_TIMEOUT_TIME = 5000;
const DEBUG_PHASE_3_MANUAL_TIME = 2000;
const DEBUG_MONOTONY_TIMEOUT_TIME = 5000;
const DEBUG_MONOTONY_MANUAL_TIME = 2000;
const DEBUG_VARIATION_TIMEOUT_TIME = 5000;
const DEBUG_VARIATION_MANUAL_TIME = 2000;
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
const runBtn = document.getElementById("run-btn");
const manualRewardBtn = document.getElementById("manual-reward-btn");
const manualIRBtn = document.getElementById("manual-ir-btn");
const manualSuccessBtn = document.getElementById("manual-success-btn");
const fileBtn = document.getElementById("file-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const stimulusRange = document.getElementById("stimulusRange");
const stimulusRangeLabel = document.getElementById("stimulusRangeLabel");
const backgroundRange = document.getElementById("backgroundRange");
const backgroundRangeLabel = document.getElementById("backgroundRangeLabel");
/* const isiInput = document.getElementById("isi-ip");
const autoCB = document.getElementById("auto-cb"); */
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

// You need to change this in rat.js as well
const USE_TABLET = true;

let mode;
let currentTrial = 0;
let waitingForBreak = false;
let generalTimer, experimentTimer;

let experimentStartTime;
let eventCounter = 0;

let stimulusColor = "green";
let stimulusShape = "circle";
let stimulusSize = "small";
let stimulusPosition = "left";

let variationFirstMainTrial;
let variationSuccessFirstMainTrial;

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
    manualSuccessBtn.disabled = false;
}

function showHidden() {
    console.log("Show hidden");
    visibilityBtns[0].style.backgroundColor = ACTIVE_BTN;
    visibilityBtns[1].style.backgroundColor = INACTIVE_BTN;
    visibilityAlert.innerHTML = "<h4>Stimulus Hidden</h4>";
    visibilityAlert.style.backgroundColor = "#FADBD8";
    manualSuccessBtn.disabled = true;
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
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                runBtn.innerHTML = "Reward";
                runBtn.disabled = false;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
            case "mode-2-manual":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Phase 2", currentTrial, "Manual");
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Waiting for IR break";
                break;
            case "mode-3":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Phase 3", currentTrial);
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Waiting for IR break";
                break;
            case "mode-monotony-initial":
                clearTimeout(generalTimer);
                mode = "mode-monotony-main";
                ipc.send("hide");
                showHidden();
                setStimulus1();
                updateEventTable("Reward", "Monotony", currentTrial, "Initial");
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
            case "mode-monotony-main":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Monotony", currentTrial, "Main");
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
            case "mode-variation-initial":
                clearTimeout(generalTimer);
                mode = "mode-variation-main";
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Variation", currentTrial, "Initial");
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
            case "mode-variation-main":
                clearTimeout(generalTimer);
                ipc.send("hide");
                showHidden();
                updateEventTable("Reward", "Variation", currentTrial, "Main");
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                if (!variationSuccessFirstMainTrial) {
                    variationSuccessFirstMainTrial = true;
                }
                waitingForBreak = true;
                feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
                break;
        }
        console.log("Correct tap");
    }
});

function handleIRBreak(event, data) {
    updateEventTable("IR Break");
    console.log(`UDP: ${data}`);

    function handleMode1IRBreak() {
        const rewardTime = debugCB.checked ? 1000 : PHASE_1_REWARD_TIME;
        const nTrials = debugCB.checked ? 3 : PHASE_1_N_TRIALS;
        console.log(data);

        feedbackAlert.innerHTML = `Trial ${currentTrial}`;

        if (currentTrial === nTrials) {
            runBtn.disabled = false;
            feedbackAlert.innerHTML = "Phase 1<br> completed";
            clearTimeout(experimentTimer);
        }
        else {
            generalTimer = setTimeout(async () => {
                updateEventTable("Reward", "Phase 1", currentTrial);
                if (USE_TABLET) {
                    await fetch(`${ROUTER_URL}/b`);
                }
                waitingForBreak = true;
                currentTrial++;
                feedbackAlert.innerHTML = `Trial ${currentTrial}`;
            }, rewardTime);
        }
    }

    function handleMode2AutomaticIRBreak() {
        feedbackAlert.innerHTML = "Automatic<br>Delay 60s";
        updateEventTable("Delay", "Phase 2", "Automatic", Math.round(PHASE_2_REWARD_TIME / 1000.0));
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Phase 2", "Automatic");
            doPhase2AutomaticTrial();
        }, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_2_REWARD_TIME);
    }

    function handleMode2ManualIRBreak() {
        // Wait 60s do manual mode
        feedbackAlert.innerHTML = "Manual<br>Delay 60s";
        updateEventTable("Delay", "Phase 2", "Manual", Math.round(PHASE_2_REWARD_TIME / 1000.0));
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Phase 2", "Manual", "Success");
            doPhase2ManualTrial();
        }, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_2_REWARD_TIME);
    }

    function handleMode3IRBreak() {
        feedbackAlert.innerHTML = "Delay 60s";
        updateEventTable("Delay", "Phase 3", Math.round(PHASE_3_REWARD_TIME / 1000.0));
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Phase 3", "Success");
            doPhase3Trial();
        }, debugCB.checked ? DEBUG_REWARD_TIME : PHASE_3_REWARD_TIME);
    }

    function handleModeMonotonyMainBreak() {
        feedbackAlert.innerHTML = "Delay 60s";
        updateEventTable("Delay", "Monotony", Math.round(MONOTONY_REWARD_TIME / 1000.0));
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Monotony", "Success");
            doMonotonyMainTrial();
        }, debugCB.checked ? DEBUG_REWARD_TIME : MONOTONY_REWARD_TIME);
    }

    function handleModeVariationMainBreak() {
        feedbackAlert.innerHTML = "Delay 60s";
        updateEventTable("Delay", "Variation", Math.round(VARIATION_REWARD_TIME / 1000.0));
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Variation", "Success");
            doVariationMainTrial();
        }, debugCB.checked ? DEBUG_REWARD_TIME : VARIATION_REWARD_TIME);
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
        case "mode-3":
            handleMode3IRBreak();
            break;
        case "mode-monotony-main":
            handleModeMonotonyMainBreak();
            break;
        case "mode-variation-main":
            handleModeVariationMainBreak();
            break;
    }

}

ipc.on("udp", handleIRBreak);

/* async function setStimulus({ shape, size, position, color }) {

    function sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    console.log("Set stimuls");

    await sleep(1500);
    ipc.send(shape);
    for (const btn of shapeBtns) {
        if (btn.innerHTML.toLowerCase() === shape) {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
    
    await sleep(1500);
    ipc.send(color);
    for (const btn of colorBtns) {
        if (btn.innerHTML.toLowerCase() === color) {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }

    await sleep(1500);
    ipc.send(size);
    for (const btn of sizeBtns) {
        if (btn.innerHTML.toLowerCase() === size) {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
   
    await sleep(1500);
    ipc.send(position);
    for (const btn of positionBtns) {
        if (btn.innerHTML.toLowerCase() === position) {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
    
} */

function updateParameterBtns() {
    shapeBtns.forEach(btn => {
        btn.style.backgroundColor = btn.innerHTML === stimulusShape ? ACTIVE_BTN : INACTIVE_BTN;
    });
    positionBtns.forEach(btn => {
        btn.style.backgroundColor = btn.innerHTML === stimulusPosition ? ACTIVE_BTN : INACTIVE_BTN;
    });
    colorBtns.forEach(btn => {
        btn.style.backgroundColor = btn.innerHTML === stimulusColor ? ACTIVE_BTN : INACTIVE_BTN;
    });
    sizeBtns.forEach(btn => {
        btn.style.backgroundColor = btn.innerHTML === stimulusSize ? ACTIVE_BTN : INACTIVE_BTN;
    });
}

function setStimulus1() {
    for (const btn of shapeBtns) {
        if (btn.innerHTML.toLowerCase() === "circle") {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
    for (const btn of colorBtns) {
        if (btn.innerHTML.toLowerCase() === "grey") {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
    for (const btn of sizeBtns) {
        if (btn.innerHTML.toLowerCase() === "large") {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }
    for (const btn of positionBtns) {
        if (btn.innerHTML.toLowerCase() === "center") {
            btn.style.backgroundColor = ACTIVE_BTN;
        }
        else {
            btn.style.backgroundColor = INACTIVE_BTN;
        }
    }

    ipc.send("stim-1");
}

function setVariationStimulus() {

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const parameters = {
        Shape: ["Circle", "Star", "Block"],
        Position: ["Left", "Center", "Right"],
        Color: ["Grey", "Green"],
        Size: ["Small", "Large"]
    };

    let newValue;
    const key = getRandomItem(Object.keys(parameters));

    switch (key) {
        case "Shape": do {
            newValue = getRandomItem(parameters.Shape);
        } while (newValue === stimulusShape);
            stimulusShape = newValue;
            break;
        case "Position": do {
            newValue = getRandomItem(parameters.Position);
        } while (newValue === stimulusPosition);
            stimulusPosition = newValue;
            break;
        case "Color": do {
            newValue = getRandomItem(parameters.Color);
        } while (newValue === stimulusColor);
            stimulusColor = newValue;
            break;
        case "Size": do {
            newValue = getRandomItem(parameters.Size);
        } while (newValue === stimulusSize);
            stimulusSize = newValue;
            break;
    }
    ipc.send(newValue.toLowerCase());
    updateEventTable(key, newValue);
    console.log("Variation", key, newValue);
}

/* function setVariationStimulus() {

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function capitalise(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    const parameters = {
        shape: ["circle", "star", "block"],
        position: ["left", "center", "right"],
        color: ["grey", "green"],
        size: ["small", "large"]
    };

    let newValue;
    const key = getRandomItem(Object.keys(parameters));

    switch (key) {
        case "shape": do {
            newValue = getRandomItem(parameters.shape);
        } while (newValue === stimulusShape);
            stimulusShape = capitalise(newValue);
            break;
        case "position": do {
            newValue = getRandomItem(parameters.position);
        } while (newValue === stimulusPosition);
            stimulusPosition = capitalise(newValue);
            break;
        case "color": do {
            newValue = getRandomItem(parameters.color);
        } while (newValue === stimulusColor);
            stimulusColor = capitalise(newValue);
            break;
        case "size": do {
            newValue = getRandomItem(parameters.size);
        } while (newValue === stimulusSize);
            stimulusSize = capitalise(newValue);
            break;
    }

    console.log("Variation", capitalise(key), capitalise(newValue));

    ipc.send(newValue);
    updateEventTable(capitalise(key), capitalise(newValue));
} */

function shapeBtnClick(event) {
    for (const btn of shapeBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    stimulusShape = event.currentTarget.innerText;
    switch (stimulusShape) {
        case "Circle": ipc.send("circle");
            break;
        case "Star": ipc.send("star");
            break;
        case "Block": ipc.send("block");
            break;
    }
    updateEventTable("Shape", stimulusShape);
}

function colorBtnClick(event) {
    for (const btn of colorBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    stimulusColor = event.currentTarget.innerText;
    switch (stimulusColor) {
        case "Green": ipc.send("green");
            break;
        case "Grey": ipc.send("grey");
            break;
    }
    updateEventTable("Color", stimulusColor);
}

function sizeBtnClick(event) {
    for (const btn of sizeBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    stimulusSize = event.currentTarget.innerText;
    switch (stimulusSize) {
        case "Small": ipc.send("small");
            break;
        case "Large": ipc.send("large");
            break;
    }
    updateEventTable("Size", stimulusSize);
}

function visibilityBtnClick(event) {
    for (const btn of visibilityBtns) {
        btn.style.backgroundColor = INACTIVE_BTN;
    }
    event.currentTarget.style.backgroundColor = ACTIVE_BTN;
    const showStimulus = event.currentTarget.innerText;
    switch (showStimulus) {
        case "Show Stimulus":
            ipc.send("show");
            showVisible();
            break;
        case "Hide Stimulus":
            ipc.send("hide");
            showHidden();
            break;
    }
    updateEventTable("Show-Manual", showStimulus);
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
    stimulusPosition = event.currentTarget.innerText;
    switch (stimulusPosition) {
        case "Left":
            ipc.send("left");
            break;
        case "Right":
            ipc.send("right");
            break;
        case "Center":
            ipc.send("center");
            break;
    }
    updateEventTable("Position", stimulusPosition);
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

async function manualRewardBtnClick(event) {
    const target = event.currentTarget;
    target.disabled = true;
    updateEventTable("Reward", "Manual");
    if (USE_TABLET) {
        await fetch(`${ROUTER_URL}/b`);
    }
    setTimeout(() => target.disabled = false, REWARD_BTN_DEAD_TIME);
}

async function manualSuccessBtnClick() {

    updateEventTable("Touch", "X = -1", "Y = -1", "Success", "Manual");

    switch (mode) {
        case "mode-2-automatic":
            clearTimeout(generalTimer); // Prevent auto trial
            mode = "mode-2-manual"; // We have a successful tap. Cease automatic, switch to manual.
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Phase 2", currentTrial, "Automatic");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            runBtn.innerHTML = "Reward";
            runBtn.disabled = false;
            feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
            break;
        case "mode-2-manual":
            clearTimeout(generalTimer);
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Phase 2", currentTrial, "Manual");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Waiting for IR break";
            break;
        case "mode-3":
            clearTimeout(generalTimer);
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Phase 3", currentTrial);
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Waiting for IR break";
            break;
        case "mode-monotony-initial":
            clearTimeout(generalTimer);
            mode = "mode-monotony-main";
            ipc.send("hide");
            showHidden();
            setStimulus1();
            updateEventTable("Reward", "Monotony", currentTrial, "Initial");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
            break;
        case "mode-monotony-main":
            clearTimeout(generalTimer);
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Monotony", currentTrial, "Main");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
            break;
        case "mode-variation-initial":
            clearTimeout(generalTimer);
            mode = "mode-variation-main";
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Variation", currentTrial, "Initial");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
            break;
        case "mode-variation-main":
            clearTimeout(generalTimer);
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Variation", currentTrial, "Main");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            if (!variationSuccessFirstMainTrial) {
                variationSuccessFirstMainTrial = true;
            }
            waitingForBreak = true;
            feedbackAlert.innerHTML = "Success!<br>Waiting for IR break";
            break;
        default:
            manualSuccessBtn.disabled = true;
    }
    console.log("Correct tap - manual. Mode:", mode);
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
    runBtn.addEventListener("click", runBtnClick);
    manualRewardBtn.addEventListener("click", manualRewardBtnClick);
    manualSuccessBtn.addEventListener("click", manualSuccessBtnClick);
    manualIRBtn.addEventListener("click", evt => {
        const btn = evt.currentTarget;
        btn.disabled = true;
        setTimeout(() => btn.disabled = false, REWARD_BTN_DEAD_TIME);
        handleIRBreak(null, "Manual");
    });
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
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Phase 2", "Manual", "Fail");
            doPhase2ManualTrial();
        }, debugCB.checked ? DEBUG_PHASE_2_MANUAL_TIME : PHASE_2_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_PHASE_2_TIMEOUT_TIME : PHASE_2_TIMEOUT_TIME);
}

function doPhase3Trial() {
    console.log("Phase 3 trial");
    currentTrial++;
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Phase 3", currentTrial);
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Phase 3");
        feedbackAlert.innerHTML = "Time Out";
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Phase 3", "Fail");
            doPhase3Trial();
        }, debugCB.checked ? DEBUG_PHASE_3_MANUAL_TIME : PHASE_3_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_PHASE_3_TIMEOUT_TIME : PHASE_3_TIMEOUT_TIME);
}

function doMonotonyInitialTrial() {
    console.log("Monotony initial trial");
    currentTrial++;
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Monotony", currentTrial);
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Monotony", "Initial");
        feedbackAlert.innerHTML = "Time Out";
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Monotony", "Fail", "Initial");
            doMonotonyInitialTrial();
        }, debugCB.checked ? DEBUG_MONOTONY_MANUAL_TIME : MONOTONY_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_MONOTONY_TIMEOUT_TIME : MONOTONY_TIMEOUT_TIME);
}

function doMonotonyMainTrial() {
    console.log("Monotony main trial");
    currentTrial++;
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Monotony", currentTrial);
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Monotony", "Main");
        feedbackAlert.innerHTML = "Time Out";
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Monotony", "Fail", "Main");
            doMonotonyInitialTrial();
        }, debugCB.checked ? DEBUG_MONOTONY_MANUAL_TIME : MONOTONY_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_MONOTONY_TIMEOUT_TIME : MONOTONY_TIMEOUT_TIME);
}

function doVariationMainTrial() {
    console.log("Variation main trial");
    currentTrial++;
    if (variationFirstMainTrial) {
        ipc.send("circle");
        stimulusShape = "Circle"
        updateEventTable("Shape", stimulusShape);

        ipc.send("large");
        stimulusSize = "Large";
        updateEventTable("Size", stimulusSize);

        ipc.send("grey");
        stimulusColor = "Grey";
        updateEventTable("Color", stimulusColor);

        ipc.send("center");
        stimulusPosition = "Center";
        updateEventTable("Position", stimulusPosition);

        variationFirstMainTrial = false;
    }
    else if (variationSuccessFirstMainTrial) { // Repeat the first main trial until success
        setVariationStimulus();
    }
    updateParameterBtns();
    ipc.send("show");
    showVisible();
    updateEventTable("Show", "Variation", currentTrial);
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Variation", "Main");
        feedbackAlert.innerHTML = "Time Out";
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Variation", "Fail", "Main");
            doVariationMainTrial();
        }, debugCB.checked ? DEBUG_VARIATION_MANUAL_TIME : VARIATION_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_VARIATION_TIMEOUT_TIME : VARIATION_TIMEOUT_TIME);
}

function doVariationInitialTrial() {
    console.log("Variation initial trial");
    currentTrial++;

    ipc.send("show");
    updateEventTable("Show", "Variation", currentTrial);

    showVisible();
    feedbackAlert.innerHTML = `Trial ${currentTrial}`;
    generalTimer = setTimeout(async function hideStimulusNoReward() {
        ipc.send("hide");
        showHidden();
        updateEventTable("Hide", "Variation", "Initial");
        feedbackAlert.innerHTML = "Time Out";
        generalTimer = setTimeout(() => {
            updateEventTable("End", "Variation", "Fail", "Initial");
            doVariationInitialTrial(); // Repeat initial trial until a success
        }, debugCB.checked ? DEBUG_VARIATION_MANUAL_TIME : VARIATION_MANUAL_TIME);
    }, debugCB.checked ? DEBUG_VARIATION_TIMEOUT_TIME : VARIATION_TIMEOUT_TIME);
}

async function runBtnClick(event) {
    const target = event.currentTarget;
    console.log(mode);
    switch (mode) {
        case "mode-1":
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            target.disabled = true;
            updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
            currentTrial = 1;
            feedbackAlert.innerHTML = `Trial ${currentTrial}<br>Waiting for IR break`;
            updateEventTable("Reward", "Phase 1", currentTrial);
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            break;
        case "mode-2-automatic":
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            target.disabled = true;
            currentTrial = 0;
            waitingForBreak = false;
            updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
            doPhase2AutomaticTrial();
            break;
        case "mode-2-manual":
            clearTimeout(generalTimer);
            target.disabled = true;
            ipc.send("hide");
            showHidden();
            updateEventTable("Reward", "Phase 2", currentTrial, "Manual");
            if (USE_TABLET) {
                await fetch(`${ROUTER_URL}/b`);
            }
            waitingForBreak = true;
            setTimeout(() => target.disabled = false, REWARD_BTN_DEAD_TIME);
            feedbackAlert.innerHTML = "Waiting for IR break";
            break;
        case "mode-3":
            target.disabled = true;
            currentTrial = 0;
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            waitingForBreak = false;
            updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
            doPhase3Trial();
            break;
        case "mode-monotony-initial":
            target.disabled = true;
            currentTrial = 0;
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            waitingForBreak = false;
            updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
            doMonotonyInitialTrial();
            break;
        case "mode-variation-initial":
            variationFirstMainTrial = true;
            variationSuccessFirstMainTrial = false;
            target.disabled = true;
            currentTrial = 0;
            experimentStartTime = Date.now();
            experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
            waitingForBreak = false;
            updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
            doVariationInitialTrial();
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
        case "4": modeMonotony();
            break;
        case "5": modeVariation();
            break;
        case "6": modeManual();
            break;
    }
}

function mode123DisableButtons() {
    document.getElementById("main-page").querySelectorAll("button").forEach(item => item.disabled = true);
    stimulusRange.disabled = true;
    backgroundRange.disabled = true;
    runBtn.disabled = false;
    fileBtn.disabled = false;
    manualIRBtn.disabled = false;
}

function modeManualEnableButtons() {
    document.getElementById("main-page").querySelectorAll("button").forEach(item => item.disabled = false);
    stimulusRange.disabled = false;
    backgroundRange.disabled = false; document.getElementById("main-page").querySelectorAll("button").forEach(item => item.disabled = false);
    stimulusRange.disabled = false;
    backgroundRange.disabled = false;
    runBtn.disabled = true;
}

function mode1() {
    mode = "mode-1";
    runBtn.innerHTML = "Start";
    mode123DisableButtons();
    feedbackAlert.innerHTML = "Phase 1";
}

function mode2() {
    mode = "mode-2-automatic";
    runBtn.innerHTML = "Start";
    mode123DisableButtons();
    feedbackAlert.innerHTML = "Phase 2";
}

function mode3() {
    mode = "mode-3";
    runBtn.innerHTML = "Start";
    mode123DisableButtons();
    feedbackAlert.innerHTML = "Phase 3";
}

function modeMonotony() {
    mode = "mode-monotony-initial";
    runBtn.innerHTML = "Start";
    mode123DisableButtons();
    feedbackAlert.innerHTML = "Monotony";
}

function modeVariation() {
    mode = "mode-variation-initial";
    runBtn.innerHTML = "Start";
    mode123DisableButtons();
    feedbackAlert.innerHTML = "Variation";
}

function modeManual() {
    mode = "manual";
    modeManualEnableButtons();
    experimentStartTime = Date.now();
    experimentTimer = setInterval(experimentTimerTimeout, CLOCK_UPDATE);
    updateEventTable("Stimulus", stimulusShape, stimulusColor, stimulusPosition, stimulusSize);
    updateEventTable("Manual");
    feedbackAlert.innerHTML = "Manual";
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
    modeManual();
}

initialise();

