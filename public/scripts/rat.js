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

    const ACCEPT_TOUCHES_DEADTIME = 200;

    // You need to change this in renderer-V2.js as well
    const USE_TABLET = true;

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
        let acceptTouches = true;

        function getBackgroundColor() {
            return `rgb(${backgroundBrightness},${backgroundBrightness},${backgroundBrightness})`;
        }

        async function onTouchStart(e) {
            let touch;
            e.preventDefault();
            currentResponse++;
            touch = e.touches[0];

            const rect = touch.target.getBoundingClientRect();
            const x = Math.round(touch.clientX - rect.left); //x position within the element.
            const y = Math.round(touch.clientY - rect.top);  //y position within the element.

            const targetHit = shape.inside({ x, y });
            const v = hidden ? "hidden" : "visible";
            const success = targetHit && (hidden === "visible");

            if (acceptTouches || success) {
                const resp = await fetch(`/tap?t=${currentTrial}&r=${currentResponse}&x=${x}&y=${y}&h=${targetHit}&sh=${stimulusType}&sz=${size}&p=${currentPosition}&f=${Shapes.Shape.brightness}&c=${color}&b=${backgroundBrightness}&v=${v}`);
                statusSpan.innerHTML = resp.statusText;
            }

            if (acceptTouches) {
                acceptTouches = false;
                setTimeout(() => {
                    acceptTouches = true;
                }, ACCEPT_TOUCHES_DEADTIME);
            }
        }

        async function onMouseDown(e) {
            e.preventDefault();
            currentResponse++;

            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.

            const targetHit = shape.inside({ x, y });
            const v = hidden ? "hidden" : "visible";
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
            if(USE_TABLET){
                canvas.addEventListener("touchstart", onTouchStart);
            }
            else{
                canvas.addEventListener("mousedown", onMouseDown);
            }
        }

        function messageHandler(message) {
            let data;
            try {
                data = JSON.parse(message.data);
            }
            catch (e) {
                statusSpan.innerHTML = `Bad message from server: ${e.message}`;
                console.log(e.message);
                console.log(message);
                return;
            }
            console.log("Command:", data.command);
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
                    console.log("shape:", shape);
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
                case "stim-1":
                    // Clear the current stimulus
                    shape.clear();

                    // Select circle
                    selectShape("circle");
                    
                    // Center it
                    currentPosition = "Centre";
                    [Shapes.Circle, Shapes.Star, Shapes.Block].forEach(elem => elem.setPosition({ x: CENTER_X, y: POSITION_Y }));
                    animationPosition.x = CENTER_X;
                    
                    // Select large
                    size = "large";
                    Shapes.Star.setSize("large");
                    Shapes.Circle.setSize("large");
                   
                    // Select white on black
                    Shapes.Shape.color = "grey";
                    Shapes.Shape.brightness = 255;
                    backgroundBrightness = 0;
                    canvas.style.backgroundColor = getBackgroundColor();
                    
                    // and draw it if it visible
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                default:
                    console.log("Command unknown.");
            }
        }

        async function initialise() {
            source.addEventListener("open", () => {
                statusSpan.innerHTML = "Connection to the server established";
            });

            source.addEventListener("message", messageHandler);
            source.addEventListener("error", (e) => {
                if(e.message){
                    statusSpan.innerHTML = `EventSource error: ${e.message}`;
                }
                else{
                    statusSpan.innerHTML = "An EventSource error occurred while attempting to connect.";
                }
                console.log("There was an EventSource error:", e);
            });
            attachListeners();

            // added 6/9/2022
            canvas.width = window.innerWidth - 15;
            canvas.height = window.innerHeight - 54;


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
                
            });
        }

        initialise();
    }

    return { run };

}());

Utility.ready(Rat.run);