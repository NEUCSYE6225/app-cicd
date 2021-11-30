const AWS = require('aws-sdk');
const logger = require('./logger');
const dynamodb = new AWS.DynamoDB.DocumentClient();

function check({username,token}){

    const getparams = {
        Key:{
            username:username
        },
        TableName: "webapp_csye6225"
    }

    return new Promise (function(resolve,reject){
        dynamodb.get(getparams,function(err,data){
            if (err){
                logger.info("dynamodb - "+err);
                reject(err)
            }
            else{
                if (!data.Item){
                    logger.info("dynamodb - invalid username");
                    reject("invalid username")
                }
                else{
                    const token_db = data.Item.token
                    const ttl = data.Item.TimeToLive
                    const curr_date = new Date()
                    logger.info("dynamodb -"+ {username,token,token_db,ttl,curr_date})
                    if (ttl < curr_date ){
                        logger.info("dynamodb -token is expired");
                        reject("token is expired")
                    }
                    else{
                        if (token_db === token){
                            logger.info(`${username} has been activated`)
                            resolve({username})
                        }
                        else{
                            reject("token is not valid")
                        }
                    }
                }
            }
        })
    })
}


module.exports = {
    check
}