const evilScan = require('evilscan');

function scanPortsForIp(ip: string) {
    let openPorts = [];
    const options = {
        target: ip,
        port: '3000 - 30000',
        status: 'TROU',
        banner: true
    };
    const scanner = new evilScan(options);
    scanner.on('result', function (data) {
        // fired when item is matching options
        if (data.status === 'open') {
            openPorts.push(data.port);
            console.log('Port ' + openPorts[openPorts.length - 1] + ' is open');
        }
    });
    scanner.on('error', function (err, data) {
        console.log('Evil Scan on error ' + data);
        throw new Error(err.toString());
    });
    scanner.on('done', function () {
        // finished !
        console.log('Evil Scan on done');
        console.log(openPorts);
        return openPorts
    });
    scanner.run();
}

module.exports = scanPortsForIp;
