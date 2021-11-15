#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "beforeInstall" >> /home/ubuntu/log.txt
while [ ! -f /home/ubuntu/autoscaling_done.txt ]
do
    echo "wait autoscaling_done.txt " >> /home/ubuntu/log.txt
    sleep 10
done
echo "/home/ubuntu/codedeploy/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/codedeploy/ >> /home/ubuntu/log.txt
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
echo "********************" >> /home/ubuntu/log.txt