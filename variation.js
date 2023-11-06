
let stimulusColor = "green";
let stimulusShape = "circle";
let stimulusSize = "small";
let stimulusPosition = "left";

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function setVariationStimulus() {

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const parameters = {
        Shape: ["Circle", "Star", "Block"],
        Position: ["Left", "Center", "Right"],
        Color: ["Grey", "Green"],
        Size: ["Small", "Large"]
    };

    let newValue;
    const key = getRandomItem(Object.keys(parameters));

    switch (key) {
        case "Shape": do {
            newValue = getRandomItem(parameters.Shape);
        } while (newValue === stimulusShape);
            stimulusShape = newValue;
            break;
        case "Position": do {
            newValue = getRandomItem(parameters.Position);
        } while (newValue === stimulusPosition);
            stimulusPosition = newValue;
            break;
        case "Color": do {
            newValue = getRandomItem(parameters.Color);
        } while (newValue === stimulusColor);
            stimulusColor = newValue;
            break;
        case "Size": do {
            newValue = getRandomItem(parameters.Size);
        } while (newValue === stimulusSize);
            stimulusSize = newValue;
            break;
    }

    console.log("Variation", key, newValue);
}

for (let i = 0; i < 10; i++) {
    setVariationStimulus();
}