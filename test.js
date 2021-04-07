
const Shape = {

   brightness: 123,
   color: "green",

   get rgb(){
       switch(this.color){
           case "green": return `rgb(0,${this.brightness},0)`;
           case "grey": return `rgb(${this.brightness},${this.brightness},${this.brightness})`;
           default: return `rgb(${this.brightness},0,0)`;
       }
   }

};

const Circle = Object.create(Shape);

Circle.initialise = function(param){
    this.param  = param;
    this.showParam = function(){
        console.log("Param:", this.param);
    };
    this.setParam = function(param){
        this.param = param;
        this.showParam();
    };
}

Circle.initialise("Hello World!");

console.log(Circle.rgb);
Circle.showParam();
Circle.setParam("Goodbye world!");