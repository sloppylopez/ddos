const udpFlood = require('./UdpFloodService');
const pingFlood = require('./PingFloodService');
const tcpFlood = require('./TcpFloodService');

// const tcpFlood = require('./services/TcpFloodService');
function flood(type, ip, scannedPort, port, timeout) {
    return new Promise((resolve, reject) => {
        switch (type) {
            case 'TCP':
                tcpFlood(ip, port, timeout, process.pid);
                break;
            case 'UDP':
                // console.log(`Worker ${process.pid} is flooding ${ip} using open port: ${scannedPort}`);
                resolve(udpFlood(ip, port, timeout, process.pid));
                break;
            case 'PING':
                resolve(pingFlood(ip, port, timeout, process.pid));
                break;
            default:
                // udpFlood(ip, port, timeout, process.pid);
                console.log('flooding... DEFAULT');
        }
    });
}

module.exports = flood;