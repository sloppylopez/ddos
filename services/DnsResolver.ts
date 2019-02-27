const dns = require('dns');

function resolveHostname(hostname) {
    return new Promise(function (resolve, reject) {
        dns.resolveAny(hostname, function (err, result) {
            let ips;
            if (err) {
                throw reject(err);
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