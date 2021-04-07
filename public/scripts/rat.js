/* global Utility Shapes */

const Rat = (function () {
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
    const CIRCLE_SMALL_R = CM_1;
    const STAR_SMALL_R1 = 1.25 * CM_1;
    const STAR_SMALL_R2 = 0.75 * CM_1;
/*    const SQUARE_SMALL_SIDE = 2 * CM_1;
    
     const CIRCLE_LARGE_R = 2 * CM_1;
    const SQUARE_LARGE_SIDE = 3 * CM_1;
     */
    const LEFT_X = 150;
    const RIGHT_X = 850;
    const CENTER_X = 500;
    const POSITION_Y = 300;
    const ANIMATION_STEP = 4;

    const ROUTER_URL = "http://192.168.4.1";

    
    function run() {
        const source = new EventSource("/events");
        const statusSpan = document.getElementById("status-span");
        const canvas = document.getElementById("c");
        const context = canvas.getContext("2d");
        const animationPosition = {
            x: LEFT_X,
            y: POSITION_Y
        };
        let direction;
        let stopAnimation = true;
        let startTime, stimulusType; 
        let color = "green"; 
        let brightness = 255;
        let size = "small";
        let backgroundColor = "white";
        let shape;
        let hidden = true;

        async function onClick(e) {
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.
            const targetHit = shape.inside({ x, y });
            const v = hidden ? "hidden" : "visible";
            const resp = await fetch(`/tap?x=${x}&y=${y}&h=${targetHit}&t=${Date.now() - startTime}&sh=${stimulusType}&sz=${size}&c=${color}&b=${backgroundColor}&v=${v}`);
            if (targetHit) {
                await fetch(`${ROUTER_URL}/b`);
            }
            else {
                await fetch(`${ROUTER_URL}/a`);
            }
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
            }
            shape.clear();
            if (!hidden) {
                shape.draw();
            }
        }

        function attachListeners() {
            canvas.addEventListener("mousedown", onClick);
        }

        function messageHandler(message) {
            switch (message.data) {
                case "close":
                    console.log("Closing!");
                    source.close();
                    statusSpan.innerHTML = "The server has closed the connection.";
                    break;
                case "circle":
                    statusSpan.innerHTML = "Circle";
                    selectShape(message.data);
                    break;
                case "star":
                    statusSpan.innerHTML = "Star";
                    selectShape(message.data);
                    break;
                case "show":
                    statusSpan.innerHTML = "Show stimulus";
                    shape && shape.draw();
                    hidden = false;
                    break;
                case "hide":
                    statusSpan.innerHTML = "Hide stimulus";
                    shape && shape.clear();
                    hidden = true;
                    break;
                case "bgWhite":
                    backgroundColor = "white";
                    statusSpan.innerHTML = "White background";
                    canvas.style.backgroundColor = backgroundColor;
                    break;
                case "bgBlack":
                    backgroundColor = "black";
                    statusSpan.innerHTML = "Black background";
                    canvas.style.backgroundColor = backgroundColor;
                    break;
                case "startAnimation":
                    statusSpan.innerHTML = "Start animation";
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
                    //Square.setSize("small");
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
                    //Square.setSize("large");
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "left":
                    statusSpan.innerHTML = "Left";
                    shape.clear();
                    [Shapes.Circle, Shapes.Star].forEach(elem => elem.setPosition({ x: LEFT_X, y: POSITION_Y }));
                    animationPosition.x = LEFT_X;
                    direction = ANIMATION_STEP;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "right":
                    shape.clear();
                    statusSpan.innerHTML = "Right";
                    direction = -1 * ANIMATION_STEP;
                    [Shapes.Circle, Shapes.Star].forEach(elem => elem.setPosition({ x: RIGHT_X, y: POSITION_Y }));
                    animationPosition.x = RIGHT_X;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "center":
                    shape.clear();
                    statusSpan.innerHTML = "Centre";
                    [Shapes.Circle, Shapes.Star].forEach(elem => elem.setPosition({ x: CENTER_X, y: POSITION_Y }));
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
            });

            source.addEventListener("message", messageHandler);
            source.addEventListener("error", (e) => {
                statusSpan.innerHTML = "<strong>There was an EventSource error!</strong> (check console for details)";
                console.log("There was an EventSource error:", e);
            });
            attachListeners();
            Shapes.Circle.initialise(context, animationPosition, CIRCLE_SMALL_R, color, brightness);
            //Square.initialise(context, animationPosition, SQUARE_SMALL_SIDE, color, brightness);
            Shapes.Star.initialise(context, animationPosition, 7, STAR_SMALL_R1, STAR_SMALL_R2, color, brightness);
            canvas.style.backgroundColor = backgroundColor;

            shape = Shapes.Circle;
            stimulusType = "circle";
            direction = ANIMATION_STEP;
           
            startTime = Date.now();
        }

        initialise();
    }

    return { run };

}());

Utility.ready(Rat.run);