#!/bin/bash
touch /home/ubuntu/log.txt
date >> /home/ubuntu/log.txt
echo "applicationStop" >> /home/ubuntu/log.txt
ls -al /home/ubuntu/webapp >> /home/ubuntu/log.txt
echo "********************" >> /home/ubuntu/log.txt