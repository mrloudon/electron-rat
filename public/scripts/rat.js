/* global Utility */

const Rat = (function () {
    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
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
        const statusSpan = document.getElementById("status-span");
        const haltBtn = document.getElementById("halt-btn");
        const canvas = document.getElementById("c");
        const context = canvas.getContext("2d");
        const position = { x: 200, y: 250 };
        let minX, maxX, direction;
        let stopAnimation = true;
        let startTime, stimulusType, shape, pingTimer;
        let keepTrying = true;
        let backgroundColor = "white";
        let currentShape = "circle";
        let state = "Idle";
        let hidden = true;

        function updateStatus(status) {
            if (status.hidden !== hidden) {
                hidden = status.hidden;
                if (hidden) {
                    shape && shape.clear();
                }
                else {
                    shape && shape.draw();
                }
            }
            if (status.backgroundColor !== backgroundColor) {
                backgroundColor = status.backgroundColor;
                canvas.style.backgroundColor = backgroundColor;
            }
            if (status.currentShape !== currentShape) {
                currentShape = status.currentShape;
                selectShape(currentShape);
            }
            if (status.stopAnimation !== stopAnimation) {
                stopAnimation = status.stopAnimation;
                if (!stopAnimation) {
                    window.requestAnimationFrame(animationLoop);
                }
            }
            if (status.state !== state) {
                state = status.state;
                statusSpan.innerHTML = state;
            }
        }

        async function onClick(e) {
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left); //x position within the element.
            const y = Math.round(e.clientY - rect.top);  //y position within the element.
            const targetHit = shape.inside({ x, y });
            const resp = await fetch(`/tap?x=${x}&y=${y}&hit=${targetHit}&t=${Date.now() - startTime}&stim=${stimulusType}`);
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
            position.x += direction;
            if ((direction > 0 && position.x > maxX) || (direction < 0 && position.x < minX)) {
                direction *= -1;
                window.requestAnimationFrame(animationLoop);
                return;
            }
            shape.clear();
            shape.setPosition(position);
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
            shape.setPosition(position);
            if (!hidden) {
                shape.draw();
            }
        }

        function attachListeners() {
            canvas.addEventListener("mousedown", onClick);
            haltBtn.addEventListener("click", () => {
                pingTimer && window.clearInterval(pingTimer);
                haltBtn.disabled = true;
                statusSpan.innerHTML = "Communication halted";
            });
        }


        async function initialise() {
            attachListeners();

            minX = 100;
            maxX = 900;
            position.y = 250;
            position.x = minX;

            Circle.initialise(context, position, CM_1, "green");
            Square.initialise(context, position, CM_1 * 2, "green");
            Star.initialise(context, position, 7, CM_1 * 1.25, CM_1 * .75, "green");
            canvas.style.backgroundColor = backgroundColor;

            shape = Circle;
            stimulusType = "circle";

            direction = 4;

            fetch("/reload")
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    statusSpan.innerHTML = text;
                })
                .catch(e => {
                    console.log("There was a problem with fetch: ", e);
                    statusSpan.innerHTML = `<strong>The server is down! Check and reload.</strong>`;
                    keepTrying = false;
                });

            startTime = Date.now();
            pingTimer = setInterval(() => {
                if (navigator.onLine && keepTrying) {
                    fetch("/status")
                        .then(response => {
                            return response.json();
                        })
                        .then(data => {
                            updateStatus(data);
                        })
                        .catch(e => {
                            console.log("There was a problem with fetch: ", e);
                            statusSpan.innerHTML = `<strong>The server is down! Check and reload.</strong>`;
                            keepTrying = false;
                        });
                }
            }, 500);
        }

        initialise();
    }

    return { run };

}());

Utility.ready(Rat.run);