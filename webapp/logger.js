const winston= require("winston")
const fs = require('fs')

const logger = winston.createLogger({
    level:'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) =>
        JSON.stringify({
            time: info.timestamp,
            level: info.level,
            message: info.message
        }) + ','
    )
    ),
    transports: [
        new winston.transports.File({ filename: '/home/ubuntu/cloudwatch/webapp.log' })
    ],
});

module.exports = logger;