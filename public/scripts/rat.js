/* global Utility Shapes */

const Rat = (function () {
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
    const CIRCLE_SMALL_R = 2 * CM_1;
    const STAR_SMALL_R1 = 2.0 * CM_1;
    const STAR_SMALL_R2 = CM_1;
    //const STAR_SMALL_R1 = 1.25 * CM_1;
    //const STAR_SMALL_R2 = 0.75 * CM_1;
    /*    const SQUARE_SMALL_SIDE = 2 * CM_1;
        
         const CIRCLE_LARGE_R = 2 * CM_1;
        const SQUARE_LARGE_SIDE = 3 * CM_1;
         */
    const LEFT_X = 200;
    const RIGHT_X = 800;
    const CENTER_X = 500;
    const POSITION_Y = 300;
    const ANIMATION_STEP = 4;

    const INITIAL_STIMULUS_BRIGHTNESS = 127;
    const INITIAL_BACKGROUND_BRIGHTNESS = 127;
    //const ABSOLUTE_START_TIME = Date.now();


    //let experimentClock;
    //let open;


    function run() {
        const source = new EventSource("/events");
        const statusSpan = document.getElementById("status-span");
        const canvas = document.getElementById("c");
        const context = canvas.getContext("2d");
        const animationPosition = {
            x: LEFT_X,
            y: POSITION_Y
        };
        let currentPosition = "Left";
        let direction;
        let stopAnimation = true;
        //let relativeStartTime = 0;
        let currentTrial = 0;
        let currentResponse = 0;
        let stimulusType;
        let color = "green";
        let size = "small";
        let backgroundBrightness = INITIAL_BACKGROUND_BRIGHTNESS;
        let shape;
        let hidden = true;

        function getBackgroundColor() {
            return `rgb(${backgroundBrightness},${backgroundBrightness},${backgroundBrightness})`;
        }

        async function onTap(e) {
            currentResponse++;
            //        const now = Date.now();
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.
            const targetHit = shape.inside({ x, y });
            const v = hidden ? "hidden" : "visible";
            //        const relativeResponseTime = currentTrial > 0 ? now - relativeStartTime : 0;
            //        const absoluteTrialTime = currentTrial > 0 ? relativeStartTime - ABSOLUTE_START_TIME : 0;
            //        const resp = await fetch(`/tap?t=${currentTrial}&r=${currentResponse}&x=${x}&y=${y}&h=${targetHit}&at=${now - ABSOLUTE_START_TIME}&rt=${relativeResponseTime}&tt=${absoluteTrialTime}&sh=${stimulusType}&sz=${size}&p=${currentPosition}&f=${Shapes.Shape.brightness}&c=${color}&b=${backgroundBrightness}&v=${v}`);
            const resp = await fetch(`/tap?t=${currentTrial}&r=${currentResponse}&x=${x}&y=${y}&h=${targetHit}&sh=${stimulusType}&sz=${size}&p=${currentPosition}&f=${Shapes.Shape.brightness}&c=${color}&b=${backgroundBrightness}&v=${v}`);
            statusSpan.innerHTML = resp.statusText;
        }

        function animationLoop() {
            if (stopAnimation) {
                return;
            }
            animationPosition.x += direction;
            if ((direction > 0 && animationPosition.x > RIGHT_X) || (direction < 0 && animationPosition.x < LEFT_X)) {
                direction *= -1;
                window.requestAnimationFrame(animationLoop);
                return;
            }
            shape.clear();
            shape.setPosition(animationPosition);
            hidden || shape.draw();
            window.requestAnimationFrame(animationLoop);
        }

        function selectShape(s) {
            shape && shape.clear();
            switch (s) {
                case "circle":
                    shape = Shapes.Circle;
                    stimulusType = "circle";
                    break;
                case "star":
                    shape = Shapes.Star;
                    stimulusType = "star"
                    break;
                case "block":
                    shape = Shapes.Block;
                    stimulusType = "block"
                    break;
            }
            shape.clear();
            if (!hidden) {
                shape.draw();
            }
        }

        function attachListeners() {
            canvas.addEventListener("mousedown", onTap);
        }

        function messageHandler(message) {
            let data;
            try {
                data = JSON.parse(message.data);
            }
            catch (e) {
                console.log(e.message);
                console.log(message);
                return;
            }
            switch (data.command) {
                case "close":
                    console.log("Closing!");
                //    open = false;
                    source.close();
                    statusSpan.innerHTML = "The server has closed the connection.";
                    break;
                case "circle":
                    statusSpan.innerHTML = "Circle";
                    selectShape(data.command);
                    break;
                case "star":
                    statusSpan.innerHTML = "Star";
                    selectShape(data.command);
                    break;
                case "block":
                    statusSpan.innerHTML = "Block";
                    selectShape(data.command);
                    break;
                case "show":
                    statusSpan.innerHTML = "Show stimulus";
                    shape && shape.draw();
                    hidden = false;
                   // relativeStartTime = Date.now();
                    currentTrial++;
                    currentResponse = 0;
                    break;
                case "hide":
                    statusSpan.innerHTML = "Hide stimulus";
                    shape && shape.clear();
                    hidden = true;
                    break;
                case "background":
                    backgroundBrightness = data.value;
                    statusSpan.innerHTML = `Background luminance: ${backgroundBrightness}`;
                    canvas.style.backgroundColor = getBackgroundColor();
                    break;
                case "foreground":
                    statusSpan.innerHTML = `Stimulus luminance: ${data.value}`;
                    Shapes.Shape.brightness = data.value;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "startAnimation":
                    statusSpan.innerHTML = "Start animation";
                    currentPosition = "Animation";
                    stopAnimation = false;
                    window.requestAnimationFrame(animationLoop);
                    break;
                case "stopAnimation":
                    statusSpan.innerHTML = "Stop animation";
                    stopAnimation = true;
                    break;
                case "green":
                    statusSpan.innerHTML = "Green";
                    Shapes.Shape.color = "green";
                    if (!hidden) {
                        shape.clear();
                        shape.draw();
                    }
                    break;
                case "grey":
                    statusSpan.innerHTML = "Grey";
                    Shapes.Shape.color = "grey";
                    if (!hidden) {
                        shape.clear();
                        shape.draw();
                    }
                    break;
                case "small":
                    size = "small";
                    statusSpan.innerHTML = "Small";
                    shape.clear();
                    Shapes.Star.setSize("small");
                    Shapes.Circle.setSize("small");
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "large":
                    size = "large";
                    statusSpan.innerHTML = "Large";
                    shape.clear();
                    Shapes.Star.setSize("large");
                    Shapes.Circle.setSize("large");
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "left":
                    statusSpan.innerHTML = "Left";
                    currentPosition = "Left";
                    shape.clear();
                    [Shapes.Circle, Shapes.Star, Shapes.Block].forEach(elem => elem.setPosition({ x: LEFT_X, y: POSITION_Y }));
                    animationPosition.x = LEFT_X;
                    direction = ANIMATION_STEP;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "right":
                    shape.clear();
                    statusSpan.innerHTML = "Right";
                    currentPosition = "Right";
                    direction = -1 * ANIMATION_STEP;
                    [Shapes.Circle, Shapes.Star, Shapes.Block].forEach(elem => elem.setPosition({ x: RIGHT_X, y: POSITION_Y }));
                    animationPosition.x = RIGHT_X;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "center":
                    shape.clear();
                    statusSpan.innerHTML = "Centre";
                    currentPosition = "Centre";
                    [Shapes.Circle, Shapes.Star, Shapes.Block].forEach(elem => elem.setPosition({ x: CENTER_X, y: POSITION_Y }));
                    animationPosition.x = CENTER_X;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "reward":
                    statusSpan.innerHTML = "Reward";
                    break;
            }
        }

        async function initialise() {
            source.addEventListener("open", () => {
                statusSpan.innerHTML = "Connection to the server established";
            //    open = true;
            });

            source.addEventListener("message", messageHandler);
            source.addEventListener("error", (e) => {
                statusSpan.innerHTML = "<strong>There was an EventSource error!</strong> (check console for details)";
                console.log("There was an EventSource error:", e);
            //    open = false;
            });
            attachListeners();
            Shapes.Circle.initialise(context, animationPosition, CIRCLE_SMALL_R, color, INITIAL_STIMULUS_BRIGHTNESS);
            Shapes.Star.initialise(context, animationPosition, 7, STAR_SMALL_R1, STAR_SMALL_R2, color, INITIAL_STIMULUS_BRIGHTNESS);
            Shapes.Block.initialise(context, animationPosition);

            backgroundBrightness = INITIAL_BACKGROUND_BRIGHTNESS;
            canvas.style.backgroundColor = getBackgroundColor();

            shape = Shapes.Circle;
            stimulusType = "circle";
            direction = ANIMATION_STEP;

            window.addEventListener("beforeunload", function () {
                source.close();
            //    open = false;
            });
            /* 
                        console.log("Starting timer");
                        experimentClock = setInterval(async function () {
                            const now = Date.now();
                            if (open) {
                                fetch(`/time?at=${now - ABSOLUTE_START_TIME}&rt=${currentTrial > 0 ? now - relativeStartTime : 0}`)
                                    .catch(e => {
                                        window.clearInterval(experimentClock);
                                        experimentClock = null;
                                        statusSpan.innerHTML = e.message;
                                        console.log("Timer killed");
                                    });
                            }
                            else {
                                clearInterval(experimentClock);
                                experimentClock = null;
                            }
                        }, 1000); */
        }

        initialise();
    }

    return { run };

}());

Utility.ready(Rat.run);