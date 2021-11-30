const AWS = require('aws-sdk');
const logger = require("./logger")
const result = require('dotenv').config()
const sns = new AWS.SNS({region: "us-east-1"});
const sns_topic = process.env.SNS_topic



async function triggerSNS({username}){
    const params = {
        Subject: "webapp-subject",
        Message: `{"username":"${username}"}`,
        TopicArn: sns_topic
    };
    logger.info(params)
    await sns.publish(params,function(err,data){
        if (err){
            logger.error("Failed to send email" + err)
        }
        else{
            logger.info(`Sent email to: ${username}`)
        }
    })
}

module.exports = {
    triggerSNS
}
// triggerSNS({username:"yongjishenmm@gmail.com"})