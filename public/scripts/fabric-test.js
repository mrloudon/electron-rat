/* global Utility fabric */
/* exported FabricTest */

// eslint-disable-next-line no-unused-vars
const FabricTest = (function () {

    const $ = function (id) {
        return document.getElementById(id);
    };

    const WIDTH = 800;
    const HEIGHT = 600;
    const V_LINE_1_X = 150;
    const V_LINE_2_X = V_LINE_1_X + (WIDTH - V_LINE_1_X) / 2;
    const H_LINE_1_Y = HEIGHT / 2;
    const ITEM_X_OFFSET = 25;
    const COL_1_X = V_LINE_1_X + (WIDTH - V_LINE_1_X) / 4;
    const COL_2_X = V_LINE_2_X + (WIDTH - V_LINE_2_X) / 2;
    const ROW_1_Y = 10;
    const ROW_2_Y = ROW_1_Y + HEIGHT / 2;

    const ITEM_PARAMS = [
        ["beer", 10, ITEM_X_OFFSET, 0.15],
        ["milk", 100, ITEM_X_OFFSET, 0.45],
        ["chicken", 180, ITEM_X_OFFSET, 0.1],
        ["juice", 250, ITEM_X_OFFSET, 0.45],
        ["beans", 360, ITEM_X_OFFSET, 0.15],
        ["croissant", 440, ITEM_X_OFFSET, 0.25],
        ["mushroom", 500, ITEM_X_OFFSET, 1.75]
    ];

    const LINE_PROPS = {
        hoverCursor: "default",
        selectable: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        stroke: "#aaa",
        strokeWidth: 1
    };

    const LABEL_PROPS = {
        selectable: false,
        hoverCursor: "default",
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        fontFamily: "arial",
        fontSize: 20,
        fill: "#666"
    };

    const ITEMS = [];

    const TABLE_CELLS = [];

    let canvas;

    const Item = {
        canvas: null,
        name: "",
        fName: "",
        obj: null,
        initialise: function (canvas, name, top, left, scale) {
            this.canvas = canvas;
            this.name = name;
            this.fName = name + ".svg";
            this.category = "";
            this.top = top;
            this.left = left;
            fabric.loadSVGFromURL(this.fName, response => {
                console.log(`I am ${this.name}`);
                this.obj = fabric.util.groupSVGElements(response);
                this.obj.set({
                    left,
                    top,
                    scaleY: scale,
                    scaleX: scale,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    hasBorders: false,
                    hasControls: false,
                    hoverCursor: "grab"
                });
                canvas.add(this.obj);
                canvas.requestRenderAll();
            });
        }
    };

    function updateCategories() {
        for (const item of ITEMS) {
            const left = item.obj.get("left");
            const top = item.obj.get("top");
            if (left < V_LINE_1_X) {
                item.category = "";
            }
            else {
                if (left < V_LINE_2_X) {
                    item.category = top < ROW_2_Y ? "1" : "3";
                }
                else {
                    item.category = top < ROW_2_Y ? "2" : "4";
                }
            }
        }
    }

    function updateTable() {
        for(const cell of TABLE_CELLS){
            cell.innerHTML = "";
        }
        for(const item of ITEMS){
            switch(item.category){
                case "1": TABLE_CELLS[0].innerHTML += (item.name + "<br>"); break;
                case "2": TABLE_CELLS[1].innerHTML += (item.name + "<br>"); break;
                case "3": TABLE_CELLS[2].innerHTML += (item.name + "<br>"); break;
                case "4": TABLE_CELLS[3].innerHTML += (item.name + "<br>"); break;
            }
        }
    }

    function mouseUp() {
        updateCategories();
        updateTable();
    }

    function preventDragOffCanvas(e) {
        let target = e.target,
            height = target.getScaledHeight(),
            width = target.getScaledWidth(),
            top = target.top,
            left = target.left,
            rightBound = this.width,
            bottomBound = this.height,
            modified = false;

        // don't move off top
        if (top < 0) {
            top = 0;
            modified = true;
        }
        // don't move off bottom
        if (top + height > bottomBound) {
            top = bottomBound - height;
            modified = true;
        }
        // don't move off left
        if (left < 0) {
            left = 0;
            modified = true;
        }
        // don't move off right
        if (left + width > rightBound) {
            left = rightBound - width;
            modified = true;
        }

        if (modified) {
            target.set("left", left);
            target.set("top", top);
            target.setCoords();
        }
    }

    function initialiseCanvas() {
        canvas = new fabric.Canvas("c", {
            backgroundColor: "#eee",
            renderOnAddRemove: false,
            selection: false
        });
        canvas.on("object:moving", preventDragOffCanvas);
        canvas.on("mouse:up", mouseUp);

        canvas.add(new fabric.Line([V_LINE_1_X, 0, V_LINE_1_X, HEIGHT], LINE_PROPS));
        canvas.add(new fabric.Line([V_LINE_2_X, 0, V_LINE_2_X, HEIGHT], LINE_PROPS));
        canvas.add(new fabric.Line([V_LINE_1_X, H_LINE_1_Y, WIDTH, H_LINE_1_Y], LINE_PROPS));

        const label1 = new fabric.Text("Category 1", LABEL_PROPS);
        label1.set({
            top: ROW_1_Y,
            left: COL_1_X - label1.width / 2
        });
        canvas.add(label1);

        const label2 = new fabric.Text("Category 2", LABEL_PROPS);
        label2.set({
            top: ROW_1_Y,
            left: COL_2_X - label1.width / 2
        });
        canvas.add(label2);

        const label3 = new fabric.Text("Category 3", LABEL_PROPS);
        label3.set({
            top: ROW_2_Y,
            left: COL_1_X - label1.width / 2
        });
        canvas.add(label3);

        const label4 = new fabric.Text("Category 4", LABEL_PROPS);
        label4.set({
            top: ROW_2_Y,
            left: COL_2_X - label1.width / 2
        });
        canvas.add(label4);

        for (const itemParams of ITEM_PARAMS) {
            const item = Object.create(Item);
            item.initialise(canvas, ...itemParams);
            ITEMS.push(item);
        }
    }

    function resetCanvas() {
        console.log("Reset canvas called.");
        for (const item of ITEMS) {
            item.obj.set("left", item.left);
            item.obj.set("top", item.top);
            item.obj.setCoords();
        }
        canvas.requestRenderAll();
        updateCategories();
        updateTable();
    }

    function ready() {
        console.log(`Ready. ${WIDTH} x ${HEIGHT}`);
        initialiseCanvas();
        TABLE_CELLS.push($("category-1"));
        TABLE_CELLS.push($("category-2"));
        TABLE_CELLS.push($("category-3"));
        TABLE_CELLS.push($("category-4"));
        $("reset-btn").addEventListener("click", resetCanvas);
    }

    Utility.ready(ready);

}());

