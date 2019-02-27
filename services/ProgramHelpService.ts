function getProgramHelp(program) {
    let programHelp = program
        .version('0.1.0')
        .option('-h, --host <host>', 'Host Name/IP')
        .option('-T, --type [type]', 'TCP, UDP or PING')
        .option('-p, --port [port]', 'If not defined, program will use random ports.', parseInt)
        .option('-t, --timeout [timeout]', 'Timeout in millisecond. If not defined, it will be unlimited.', parseInt);

    programHelp.parse(process.argv);
    return programHelp;
}

module.exports = getProgramHelp;