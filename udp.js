const dgram = require("dgram");

const client = dgram.createSocket("udp4");
const message = new Buffer.from("1234");

client.bind(function(){
    client.setBroadcast(true);
});

client.send(message, 0, message.length, 8081, "255.255.255.255", (err) => {
    console.log("Sent");
    console.log(err);
    process.exit();
});



