
// eslint-disable-next-line no-unused-vars
const Shapes = (function () {

    const PX_PER_MM = 600 / 93;
    const CM_1 = 10 * PX_PER_MM;
    const CIRCLE_SMALL_R = CM_1;
    const CIRCLE_LARGE_R = 2 * CM_1;
    const STAR_SMALL_R1 = 1.25 * CM_1;
    const STAR_SMALL_R2 = 0.75 * CM_1;
    const STAR_LARGE_R1 = 2 * CM_1;
    const STAR_LARGE_R2 = CM_1;

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

    const Shape = {
        brightness: 127,
        color: "green",

        get rgb() {
            switch (this.color) {
                case "green": return `rgb(0,${this.brightness},0)`;
                case "grey": return `rgb(${this.brightness},${this.brightness},${this.brightness})`;
                default: return `rgb(${this.brightness},0,0)`;
            }
        }
    };

    const Circle = Object.create(Shape);
    const Star = Object.create(Shape);

    Circle.initialise = function(context, center, radius){

        this.setPosition = function(pos) {
            this.center = pos;
            this.boundary = [this.center.x - this.radius - 1, this.center.y - this.radius - 1, 2 * this.radius + 2, 2 * this.radius + 2];
        };

        this.setSize = function(size) {
            switch (size) {
                case "small":
                    this.radius = Math.floor(CIRCLE_SMALL_R);
                    break;
                case "large":
                    this.radius = Math.floor(CIRCLE_LARGE_R);
                    break;
            }
            this.setPosition(this.center);
        };

        this.setPosition = function(pos) {
            this.center = pos;
            this.boundary = [this.center.x - this.radius - 1, this.center.y - this.radius - 1, 2 * this.radius + 2, 2 * this.radius + 2];
        };

        this.draw = function() {
            this.ctx.clearRect(...this.boundary);
            this.ctx.fillStyle = this.rgb;
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
        };

        this.clear = function() {
            this.ctx.clearRect(...this.boundary);
        };

        this.inside = function(point) {
            return (this.center.x - point.x) ** 2 + (this.center.y - point.y) ** 2 <= this.radius ** 2
        };

        this.ctx = context;
        this.center = center;
        this.radius = Math.floor(radius);
        this.setPosition(center);
    };

    Star.initialise = function(context, center, nSides, radius1, radius2) {

        this.setSize = function(size) {
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
        };

        this.setPosition = function(center) {
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
        };

        this.draw = function() {
            this.ctx.fillStyle = this.rgb;
            this.ctx.beginPath();
            this.ctx.moveTo(...this.vertices[0]);
            for (let n = 1; n < this.vertices.length; n++) {
                this.ctx.lineTo(...this.vertices[n]);
            }
            this.ctx.closePath();
            this.ctx.fill();
        };

        this.clear = function() {
            this.ctx.clearRect(...this.boundary);
        };

        this.inside = function(point) {
            return pointInPoly(point, this.vertices);
        };

        this.ctx = context;
        this.nSides = nSides;
        this.radius1 = Math.floor(radius1);
        this.radius2 = Math.floor(radius2);
        this.setPosition(center);
    };

    return { Shape, Circle, Star };

}());