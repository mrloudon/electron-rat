/* global Utility */

const Rat = (function () {
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
    const CIRCLE_SMALL_R = CM_1;
    const SQUARE_SMALL_SIDE = 2 * CM_1;
    const STAR_SMALL_R1 = 1.25 * CM_1;
    const STAR_SMALL_R2 = 0.75 * CM_1;
    const CIRCLE_LARGE_R = 2 * CM_1;
    const SQUARE_LARGE_SIDE = 3 * CM_1;
    const STAR_LARGE_R1 = 2 * CM_1;
    const STAR_LARGE_R2 = CM_1;
    const LEFT_X = 150;
    const RIGHT_X = 850;
    const CENTER_X = 500;
    const POSITION_Y = 300;
    const ANIMATION_STEP = 4;

    const ROUTER_URL = "http://192.168.4.1";

    const Star = {

        initialise(context, center, nSides, radius1, radius2, color) {
            this.ctx = context;
            this.nSides = nSides;
            this.radius1 = Math.floor(radius1);
            this.radius2 = Math.floor(radius2);
            this.color = color;
            this.setPosition(center);
        },

        setSize(size) {
            switch (size) {
                case "small":
                    this.radius1 = Math.floor(STAR_SMALL_R1);
                    this.radius2 = Math.floor(STAR_SMALL_R2);
                    break;
                case "large":
                    this.radius1 = Math.floor(STAR_LARGE_R1);
                    this.radius2 = Math.floor(STAR_LARGE_R2);
                    break;
            }
            this.setPosition(this.center);
        },

        setPosition(center) {
            this.vertices = [];
            this.center = center;
            const deltaTheta = 2 * Math.PI / this.nSides;
            let innerTheta = 0;
            let x, y;
            let outerTheta = innerTheta + deltaTheta / 2;
            for (let n = 0; n < this.nSides; n++) {
                x = Math.floor(this.radius1 * Math.cos(innerTheta) + center.x);
                y = Math.floor(this.radius1 * Math.sin(innerTheta) + center.y);
                this.vertices.push([x, y]);
                x = Math.floor(this.radius2 * Math.cos(outerTheta) + center.x);
                y = Math.floor(this.radius2 * Math.sin(outerTheta) + center.y);
                this.vertices.push([x, y]);
                innerTheta += deltaTheta;
                outerTheta += deltaTheta;
            }
            this.boundary = [this.center.x - this.radius1 - 1, this.center.y - this.radius1 - 1, this.radius1 * 2 + 2, this.radius1 * 2 + 2];
        },

        draw() {
            this.ctx.strokeStyle = this.color;
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.moveTo(...this.vertices[0]);
            for (let n = 1; n < this.vertices.length; n++) {
                this.ctx.lineTo(...this.vertices[n]);
            }
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.boundary);
        },

        inside(point) {
            return pointInPoly(point, this.vertices);
        }

    };

    const Square = {

        initialise(context, center, sideLength, color) {
            this.ctx = context;
            this.center = center;
            this.sideLength = Math.floor(sideLength);
            this.color = color;
            this.setPosition(center);
        },

        setSize(size) {
            switch (size) {
                case "small":
                    this.sideLength = Math.floor(SQUARE_SMALL_SIDE);
                    break;
                case "large":
                    this.sideLength = Math.floor(SQUARE_LARGE_SIDE);
                    break;
            }
            this.setPosition(this.center);
        },

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.rect(...this.boundary);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.boundary);
        },

        setPosition(pos) {
            this.center = pos;
            this.boundary = [Math.floor(this.center.x - this.sideLength / 2), Math.floor(this.center.y - this.sideLength / 2), this.sideLength, this.sideLength];
        },

        inside(point) {
            return this.boundary[0] <= point.x && point.x <= this.boundary[0] + this.boundary[2] &&
                this.boundary[1] <= point.y && point.y <= this.boundary[1] + this.boundary[3];
        }

    };

    const Circle = {

        initialise(context, center, radius, color) {
            this.ctx = context;
            this.center = center;
            this.radius = Math.floor(radius);
            this.color = color;
            this.setPosition(center);
        },

        setSize(size) {
            switch (size) {
                case "small":
                    this.radius = Math.floor(CIRCLE_SMALL_R);
                    break;
                case "large":
                    this.radius = Math.floor(CIRCLE_LARGE_R);
                    break;
            }
            this.setPosition(this.center);
        },

        draw() {
            this.ctx.clearRect(...this.boundary);
            this.ctx.strokeStyle = this.color;
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.boundary);
        },

        setPosition(pos) {
            this.center = pos;
            this.boundary = [this.center.x - this.radius - 1, this.center.y - this.radius - 1, 2 * this.radius + 2, 2 * this.radius + 2];
        },

        inside(point) {
            return (this.center.x - point.x) ** 2 + (this.center.y - point.y) ** 2 <= this.radius ** 2
        }

    };

    function pointInPoly(point, vs) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        let x = point.x, y = point.y;

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }


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
                    shape = Circle;
                    stimulusType = "circle";
                    break;
                case "square":
                    shape = Square;
                    stimulusType = "square";
                    break;
                case "star":
                    shape = Star;
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
                case "square":
                    statusSpan.innerHTML = "Square";
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
                case "blue":
                    statusSpan.innerHTML = "Blue";
                    [Circle, Star, Square].forEach(elem => elem.color = "blue");
                    if (!hidden) {
                        shape.clear();
                        shape.draw();
                    }
                    break;
                case "yellow":
                    statusSpan.innerHTML = "Yellow";
                    [Circle, Star, Square].forEach(elem => elem.color = "yellow");
                    if (!hidden) {
                        shape.clear();
                        shape.draw();
                    }
                    break;
                case "green":
                    statusSpan.innerHTML = "Green";
                    [Circle, Star, Square].forEach(elem => elem.color = "green");
                    if (!hidden) {
                        shape.clear();
                        shape.draw();
                    }
                    break;
                case "small":
                    size = "small";
                    statusSpan.innerHTML = "Small";
                    shape.clear();
                    Star.setSize("small");
                    Circle.setSize("small");
                    Square.setSize("small");
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "large":
                    size = "large";
                    statusSpan.innerHTML = "Large";
                    shape.clear();
                    Star.setSize("large");
                    Circle.setSize("large");
                    Square.setSize("large");
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "left":
                    statusSpan.innerHTML = "Left";
                    shape.clear();
                    [Circle, Star, Square].forEach(elem => elem.setPosition({ x: LEFT_X, y: POSITION_Y }));
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
                    [Circle, Star, Square].forEach(elem => elem.setPosition({ x: RIGHT_X, y: POSITION_Y }));
                    animationPosition.x = RIGHT_X;
                    if (!hidden) {
                        shape.draw();
                    }
                    break;
                case "center":
                    shape.clear();
                    statusSpan.innerHTML = "Centre";
                    [Circle, Star, Square].forEach(elem => elem.setPosition({ x: CENTER_X, y: POSITION_Y }));
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
            Circle.initialise(context, animationPosition, CIRCLE_SMALL_R, color);
            Square.initialise(context, animationPosition, SQUARE_SMALL_SIDE, color);
            Star.initialise(context, animationPosition, 7, STAR_SMALL_R1, STAR_SMALL_R2, color);
            canvas.style.backgroundColor = backgroundColor;

            shape = Circle;
            stimulusType = "circle";
            direction = ANIMATION_STEP;
           
            startTime = Date.now();
        }

        initialise();
    }

    return { run };

}());

Utility.ready(Rat.run);