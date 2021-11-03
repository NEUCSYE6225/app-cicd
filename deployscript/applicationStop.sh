#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "applicationStop" >> /home/ubuntu/log.txt
echo "/home/ubuntu/codedeploy/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/codedeploy/ >> /home/ubuntu/log.txt
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
sudo pm2 stop webapp >> /home/ubuntu/log.txt
echo "********************" >> /home/ubuntu/log.txt