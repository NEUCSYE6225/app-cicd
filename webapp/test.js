const SDC = require('statsd-client');
const aws_sdc = new SDC()



const start = Date.now()
aws_sdc.increment('test');
setTimeout(() => { 
    
    const end = Date.now()

    console.log(end- start)
    aws_sdc.timing("test",end- start)
}, 5000);
