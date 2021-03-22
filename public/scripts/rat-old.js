/* global Utility */

const Rat = (function () {

    let h1, h4;
    let index = 0;
    const positions = [{ x: 100, y: 150 }, { x: 300, y: 650 }, { x: 500, y: 600 }, { x: 500, y: 200 }];
    const colors = ["red", "green", "blue", "yellow"];
    const PX_PER_MM = 600 / 93;

    const Circle = {
        ctx: null,
        cnvs: null,
        color: "blue",
        radius: 10 * PX_PER_MM,
        x: 0,
        y: 0,

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.rect(this.center.x - this.sideLength / 2, this.center.y - this.sideLength / 2, this.sideLength, this.sideLength);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height);
        },

        initialise(context, canvas) {
            this.ctx = context;
            this.cnvs = canvas;
        }

    };

    const Equilateral = {

        color: "blue",
        ctx: null,
        vertices: [],
        rect: [],
        deltaX: 0,
        deltaY: 0,
        sideLength: 0,

        draw() {
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.moveTo(...this.vertices[0]);
            this.ctx.lineTo(...this.vertices[1]);
            this.ctx.lineTo(...this.vertices[2]);
            this.ctx.closePath();
            this.ctx.fill();
        },

        clear() {
            this.ctx.clearRect(...this.rect);
        },


        move(center) {
            const y12 = center.y + this.deltaY / 2;
            const y3 = center.y - this.deltaY;
            const x1 = center.x - this.deltaX;
            const x2 = center.x + this.deltaX;
            this.vertices = [[x1, y12], [x2, y12], [center.x, y3]];
            this.rect[0] = x1;
            this.rect[1] = y3;
            this.rect[2] = this.sideLength;
            this.rect[3] = this.deltaY * 3;
        },

        initialise(context, sideLength, center, color) {
            this.color = color;
            this.ctx = context;
            this.sideLength = sideLength;
            this.deltaX = sideLength / 2;
            this.deltaY = sideLength * 1 / Math.sqrt(3);
            this.move(center);
        }

    };


    function inside(point, vs) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        let x = point[0], y = point[1];

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

    // array of coordinates of each vertex of the polygon
    // var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
    // inside([ 1.5, 1.5 ], polygon); // true

    async function onClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left); //x position within the element.
        const y = Math.round(e.clientY - rect.top);  //y position within the element.
        setTimeout(() => h4.innerHTML = "&nbsp;", 500);
        const targetHit = inside([x, y], Equilateral.vertices);
        h1.innerHTML = `${x}, ${y}, ${targetHit}`;
        const resp = await fetch(`/tap?x=${x}&y=${y}&t=${targetHit}`);
        h4.innerHTML = resp.statusText;
        Equilateral.clear();
        index++;
        Equilateral.color = colors[index % positions.length];
        Equilateral.move(positions[index % positions.length]);
        Equilateral.draw();
    }

    /* function fullScreen() {
        let elem = document.querySelector("canvas");

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    } */


    function run() {
        console.log("Running");
        document.querySelector("h1").innerHTML = "Rat running";

        const canvas = document.getElementById("c");
        const ctx = canvas.getContext("2d");

        Equilateral.initialise(ctx, 200, positions[index], colors[index]);
        Equilateral.draw();

        Circle.initialise(ctx, canvas);
        Circle.x = 300;
        Circle.y = 300;
        Circle.draw();
        setTimeout(() => Circle.clear.call(Circle), 2000);


        canvas.addEventListener("click", onClick, false);
        h1 = document.querySelector("h1");
        h4 = document.querySelector("h4");

    }

    return { run, inside };

}());

Utility.ready(Rat.run);