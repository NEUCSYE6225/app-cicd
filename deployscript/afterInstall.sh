#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "afterInstall" >> /home/ubuntu/log.txt
echo "/home/ubuntu/codedeploy/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/codedeploy/ >> /home/ubuntu/log.txt
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
echo "cp /home/ubuntu/codedeploy/webapp/*.js /home/ubuntu/webapp/" >> /home/ubuntu/log.txt
cp /home/ubuntu/codedeploy/webapp/*.js /home/ubuntu/webapp/
sleep 3
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
echo "********************" >> /home/ubuntu/log.txt