const MAX_NUM_PORTS = 65535;//0 to 1023 are reserved
function findStartAndEndPorts(id: number, numCPUs: number): any {
    let chunkSize = Math.floor(MAX_NUM_PORTS / numCPUs);
    let portMap = {};
    for (let i = 1; i <= numCPUs; i++) {
        if (i == numCPUs) {
            portMap[i] = [chunkSize * i - chunkSize, MAX_NUM_PORTS];//TODO refactor
        } else {
            portMap[i] = [chunkSize * i - chunkSize, chunkSize * i];
        }
    }
    return portMap[id]
}

module.exports = findStartAndEndPorts;