

function fet(options) {
    const { timeout = 1000 } = options;


    const temp = {
        ...options,
        name: "Hello"
    };

    console.log(timeout);
    return temp;
}


const result = fet({
    timeout: 50,
    pet: "Cat"
});

console.log(result);