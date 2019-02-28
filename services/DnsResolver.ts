const dns = require('dns');

function resolveHostname(hostname) { //TODO sometimes the dns.resolveAny method seems to fail... try to discover why
    return new Promise((resolve, reject) => {
        dns.resolveAny(hostname, (err, result) => {
            let ips;
            if (err) {
                console.log(err);
                return reject(err);
            }
            const ipsFilter = (item) => {
                return item.type === 'A' || item.type === 'AAAA';//Ipv4 Ipv6
            };
            ips = result.filter(ipsFilter);
            return resolve(ips);
        });
    });
}

module.exports = resolveHostname;