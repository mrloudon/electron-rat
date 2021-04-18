function test(o) {
    const { t = 8000 } = o;
    const a = {...o};
    console.log("t = ", t);
    console.log("a = ", a);
    console.log("o = ", o);
}

test({
    j: "Hello"
});