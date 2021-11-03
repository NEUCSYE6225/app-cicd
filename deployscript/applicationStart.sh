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
pm2 start app.js --name webapp --watch --ignore-watch="node_modules"
echo "********************" >> /home/ubuntu/log.txt