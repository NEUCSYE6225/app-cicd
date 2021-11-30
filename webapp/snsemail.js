const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const logger = require("./logger")
const result = require('dotenv').config()
const sns_topic = process.env.SNS_topic
async function triggerSNS({username}){

    const params = {
        Message: `{"username":"${username}"}`,
        TopicArn: sns_topic
    };

    console.log(params)

    await sns.publish(params,function(err,data){
        if (err){
            logger.error("Failed to send email" + err)
        }
        else{
            logger.info(`Sent email to: ${username}`)
        }
    })
}

module.exports = triggerSNS;

// triggerSNS({username:"yongjishenmm@gmail.com"})