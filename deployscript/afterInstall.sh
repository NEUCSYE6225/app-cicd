#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "afterInstall" >> /home/ubuntu/log.txt
while [ ! -f /home/ubuntu/autoscaling_done.txt ]
do
    echo "wait autoscaling_done.txt " >> /home/ubuntu/log.txt
    sleep 10
done
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
sudo cp /home/ubuntu/codedeploy/cloudwatch-config.json /home/ubuntu/webapp/
sudo cp /home/ubuntu/codedeploy/webapp/*.js /home/ubuntu/webapp/
sudo cp /home/ubuntu/codedeploy/version.info /home/ubuntu/webapp/
sleep 1
echo "/home/ubuntu/webapp/" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp/ >> /home/ubuntu/log.txt
echo "cloudwatch" >> /home/ubuntu/log.txt
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/home/ubuntu/webapp/cloudwatch-config.json \
    -s >> /home/ubuntu/log.txt
echo "********************" >> /home/ubuntu/log.txt