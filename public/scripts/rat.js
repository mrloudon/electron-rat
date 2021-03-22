/* global Utility */

const Rat = (function () {

    const MILLIS_SEC = 1000;
    const MILLIS_MIN = 1000 * 60;
    const MILLIS_HR = 60 * MILLIS_MIN;
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
    //const MARGIN = 0;

    const Star = {

        initialise(context, center, nSides, radius1, radius2, color) {
            this.ctx = context;
            this.nSides = nSides;
            this.radius1 = Math.floor(radius1);
            this.radius2 = Math.floor(radius2);
            this.color = color;
            this.setPosition(center);
        },

        setPosition(center) {
            this.vertices = [];
            this.center = center;
            const deltaTheta = 2 * Math.PI / this.nSides;
            let innerTheta = 0;
            let x, y;
            let outerTheta = innerTheta + deltaTheta / 2;
            for (let n = 0; n < this.nSides; n++) {
                x = this.radius1 * Math.cos(innerTheta) + center.x;
                y = this.radius1 * Math.sin(innerTheta) + center.y;
                this.vertices.push([x, y]);
                x = this.radius2 * Math.cos(outerTheta) + center.x;
                y = this.radius2 * Math.sin(outerTheta) + center.y;
                this.vertices.push([x, y]);
                innerTheta += deltaTheta;
                outerTheta += deltaTheta;
            }
            this.boundary = [this.center.x - this.radius1, this.center.y - this.radius1, this.radius1 * 2, this.radius1 * 2];
        },

        draw() {
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
            return this.poly[0] <= point.x && point.x <= this.poly[0] + this.poly[2] &&
                this.poly[1] <= point.y && point.y <= this.poly[1] + this.poly[3];
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

        draw() {
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
        //const coordsFB = document.querySelector("h3.coords");
        const stopBtn = document.getElementById("stop-btn");
        const startBtn = document.getElementById("start-btn");
        const whiteBtn = document.getElementById("white-btn");
        const blackBtn = document.getElementById("black-btn");
        const showBtn = document.getElementById("show-btn");
        const hideBtn = document.getElementById("hide-btn");
        const squareBtn = document.getElementById("square-btn");
        const circleBtn = document.getElementById("circle-btn");
        const starBtn = document.getElementById("star-btn");
        const timeSpan = document.getElementById("time-span");
        const statusSpan = document.getElementById("status-span");
        const canvas = document.getElementById("c");
        const context = canvas.getContext("2d");
        const position = { x: 200, y: 250 };
        let minX, maxX, direction;
        let stopAnimation = false;
        let startTime, stimulusType, shape;

        async function onClick(e) {
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.
            const targetHit = shape.inside({ x, y });
            const resp = await fetch(`/tap?x=${x}&y=${y}&hit=${targetHit}&t=${Date.now() - startTime}&stim=${stimulusType}`);
            console.log(resp.statusText);
        }

        function animationLoop() {
            if (stopAnimation) {
                return;
            }
            position.x += direction;
            if ((direction > 0 && position.x > maxX) || (direction < 0 && position.x < minX)) {
                direction *= -1;
                window.requestAnimationFrame(animationLoop);
                return;
            }
            shape.clear();
            shape.setPosition(position);
            shape.draw();
            window.requestAnimationFrame(animationLoop);
        }

        function attachListeners() {
            stopBtn.addEventListener("click", () => stopAnimation = true);
            startBtn.addEventListener("click", () => {
                stopAnimation = false;
                window.requestAnimationFrame(animationLoop);
            });
            whiteBtn.addEventListener("click", () => canvas.style.backgroundColor = "white");
            blackBtn.addEventListener("click", () => canvas.style.backgroundColor = "black");
            showBtn.addEventListener("click", () => shape && shape.draw());
            hideBtn.addEventListener("click", () => shape && shape.clear());
            squareBtn.addEventListener("click", () => {
                let temp = stopAnimation;
                stopAnimation = true;
                window.requestAnimationFrame(() => {
                    shape && shape.clear();
                    shape = Square;
                    stimulusType = "square";
                    shape.setPosition(position);
                    shape.draw();
                    stopAnimation = temp;
                    if (!stopAnimation) {
                        window.requestAnimationFrame(animationLoop);
                    }
                });
            });
            circleBtn.addEventListener("click", () => {
                let temp = stopAnimation;
                stopAnimation = true;
                window.requestAnimationFrame(() => {
                    shape && shape.clear();
                    shape = Circle;
                    stimulusType = "circle";
                    shape.setPosition(position);
                    shape.draw();
                    stopAnimation = temp;
                    if (!stopAnimation) {
                        window.requestAnimationFrame(animationLoop);
                    }
                });
            });
            starBtn.addEventListener("click", () => {
                let temp = stopAnimation;
                stopAnimation = true;
                window.requestAnimationFrame(() => {
                    shape && shape.clear();
                    shape = Star;
                    stimulusType = "star";
                    shape.setPosition(position);
                    shape.draw();
                    stopAnimation = temp;
                    if (!stopAnimation) {
                        window.requestAnimationFrame(animationLoop);
                    }
                });
            });
            canvas.addEventListener("mousedown", onClick);
        }

        attachListeners();

        minX = 100;
        maxX = 900;
        position.y = 250;
        position.x = minX;

        Circle.initialise(context, position, CM_1, "green");
        Square.initialise(context, position, CM_1 * 2, "green");
        Star.initialise(context, position, 7, CM_1 * 1.25, CM_1 * .75, "green");

        shape = Circle;
        stimulusType = "circle";
        shape.draw();

        direction = 4;
        requestAnimationFrame(animationLoop);

        startTime = Date.now();
        setInterval(() => {
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
                fetch("/status")
                .then(response => response.json())
                .then(data => {
                    statusSpan.innerHTML = `Status: <strong>${data.state}</strong>`;
                })
                .catch(e => console.log(e.message));
        }, 1000);
    }

    return { run };

}());

Utility.ready(Rat.run);