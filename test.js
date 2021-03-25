
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const IP_REG_EXP = /192\.168\.4\.[2-9]/;

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if(IP_REG_EXP.test(net.address)){
                console.log("IP: ", net.address);
            }
        }
    }
} 
