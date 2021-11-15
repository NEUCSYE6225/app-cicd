#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "applicationStart" >> /home/ubuntu/log.txt
killall -9 node
echo "/home/ubuntu/codedeploy/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/codedeploy/ >> /home/ubuntu/log.txt
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
cd /home/ubuntu/webapp/
sudo pm2 start server.js --name webapp --watch --ignore-watch="node_modules"  >> /home/ubuntu/log.txt
sleep 1
# sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
echo "********************" >> /home/ubuntu/log.txt