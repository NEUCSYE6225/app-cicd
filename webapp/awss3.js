const AWS = require('aws-sdk');
const result = require('dotenv').config()
const fs = require('fs');
const bucket_name = process.env.Bucket_name
const s3 = new AWS.S3()

function uploadfile({path,encodeimage}) {
    // console.log(encodeimage)
    const buffer = encodeimage
    const key = path.replace(`${bucket_name}/`,'')
    const params = {
        Bucket: bucket_name,
        Key: key,
        Body: buffer
    }
    return s3.putObject(params).promise()
}

function deletefile(url){
    const key = url.replace(`${bucket_name}/`,'')
    const params = {
        Bucket: bucket_name,
        Key: key
    }
    return s3.deleteObject(params).promise()
}


// function testuploadfile(image) {
//     // console.log(encodeimage)
//     const buffer = fs.readFileSync(image)
//     const params = {
//         Bucket: bucket_name,
//         Key: image,
//         Body: buffer
//     }
//     // s3.upload(params,function (err,data){
//     //     if (err){
//     //         console.log(err)
//     //     } 
//     //     else{
//     //     console.log(data)
//     //     }
//     // })
//     return s3.putObject(params).promise()
// }

// testuploadfile("stack-abuse-logo-out.png")
// // // deletefile("9aae111c-8b83-4316-8fd9-5e1d61d0bda3")
// .then((data)=>{
//     console.log("OK")
//     console.log(data)
// })
// .catch((err)=>{
//     console.log(err)
// })

module.exports = {
    s3,
    uploadfile,
    deletefile
}

