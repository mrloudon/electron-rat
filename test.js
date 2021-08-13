

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

const Block = Object.create(Shape);

Block.initialise = function(context, center){

    this.setSize = function(){};

    this.whoAmI = function(){
        console.log(this === Block);
    };

    this.setPosition = function(position){
        this.position = position;
        this.boundary = [this.center.x - this.width / 2 - 1, this.center.y - this.height / 2 - 1,
            this.width, this.height];
    };

    this.width = 40;
    this.height = 20;
    this.center = center;
    this.ctx = context;
}

Block.initialise("my context", {x: 200, y: 100});
Block.setPosition("my position");

console.log(Block);
console.log(Block.boundary);
console.log(Block.position);
Block.whoAmI();