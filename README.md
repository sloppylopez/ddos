# ddos

1)npm run server:start

2)ts-node App.ts -h localhost -t 200000 -x PING

or

2)ts-node App.ts -h localhost -t 200000 -x UDP

or

2)ts-node App.ts -h localhost -t 200000 -x TCP

Working Features:

1)TCP Flood

2)UDP Flood

3)PING Flood

Observations:

This project was build in 48 hours using a Windows 10 Fresh Laptop

You will need to start you IDE in admin mode on Windows 10 for the raw-socket to work

Doing PING flood instead of SYN since I did not had time to find any configuration valid 
to use with raw-socket

The TCP flooding is a bit random yet but it works

Missing TypeScript script mode active

Missing refactor

Missing use Chalk

Missing graceful exit with key pressed

Missing take in consideration IPv6 to open a udp6 socket

How it works:

It will try to open a process per core in the CPU (although this is right now divided by 4 for debugging purposes and developing purposes)
each process will try to attack the range of 0-65535 TCP UDP ports, then due to limitations in dependencies like
port scanner it will try ranges to discover open ports using chunks of 8000 ports

Example:
        Worker 1 will attempt to discover ports from 0 to 8000
        
        Worker 2 will attempt to discover ports from 8001 to 16000
        
        etc
        etc
        
After a worker finds a port, it will start the flooding by opening a socker and sending X number of messages, at the moment it's a hardcoded value
of 1000)

We need to add the feature to gracefully exit when command received for obvious reasons