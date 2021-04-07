const Star = {

    initialise(context, center, nSides, radius1, radius2, color, brightness) {
        this.ctx = context;
        this.nSides = nSides;
        this.radius1 = Math.floor(radius1);
        this.radius2 = Math.floor(radius2);
        this.color = color;
        this.brightness = brightness;
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

    getRGB(){
        switch(this.color){
            case "green":    return `rgb(0,${this.brightness},0)`;
            case "blue": return `rgb(0,0,${this.brightness})`;
            case "yellow": return `rgb(${this.brightness},${this.brightness},0)`;
            default: return `rgb(255,255,255)`;
        }
    },

    draw() {
        //this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.getRGB();
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

    initialise(context, center, sideLength, color, brightness) {
        this.ctx = context;
        this.center = center;
        this.sideLength = Math.floor(sideLength);
        this.color = color;
        this.brightness = brightness;
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

    getRGB(){
        switch(this.color){
            case "green":    return `rgb(0,${this.brightness},0)`;
            case "blue": return `rgb(0,0,${this.brightness})`;
            case "yellow": return `rgb(0,${this.brightness},${this.brightness})`;
            default: return `rgb(255,255,255)`;
        }
    },

    draw() {
        this.ctx.fillStyle = this.getRGB();
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

    initialise(context, center, radius, color, brightness) {
        this.ctx = context;
        this.center = center;
        this.radius = Math.floor(radius);
        this.color = color;
        this.brightness = brightness;
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

    getRGB(){
        switch(this.color){
            case "green":    return `rgb(0,${this.brightness},0)`;
            case "blue": return `rgb(0,0,${this.brightness})`;
            case "yellow": return `rgb(${this.brightness},${this.brightness},0)`;
            default: return `rgb(255,255,255)`;
        }
    },

    draw() {
        this.ctx.clearRect(...this.boundary);
        //this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.getRGB();
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




function hideBtnClick() {
    ipc.send("hide");
}

const MILLIS_SEC = 1000;
const MILLIS_MIN = 1000 * 60;
const MILLIS_HR = 60 * MILLIS_MIN;

function startBtnClick() {
    if (clockTimer) {
        window.clearInterval(clockTimer);
    }
    startTime = Date.now();
    clockTimer = setInterval(() => {
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
    }, 1000);
}
