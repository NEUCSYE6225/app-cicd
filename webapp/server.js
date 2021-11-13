const express = require('express');
const bodyParser = require('body-parser')
const help = require('./helper')
const db = require('./database')
const aws_s3 = require("./awss3")
const mime = require('mime-types')
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.raw({type: 'image/*',limit: '10mb'}));
app.use(express.json())

app.get('/v2/user/self',(req,res)=>{
    // fetch username data
    // get auth
    const auth = req.headers.authorization
    if (!auth){
        // res.status(401).json()
        res.status(401).json({result:'No auth'})
        return;
    }
    // decode username and password
    const username_password = Buffer.from(auth.split(' ')[1],'base64').toString().split(':')
    const curr_username = username_password[0].trim()
    const curr_password = username_password[1].trim()

    // check if empty
    if (!curr_username || !curr_password){
        // res.status(400).json()
        res.status(400).json({result:'Empty Input from auth'})
        return;
    }
    // check if a valid email address
    if (!help.validateEmail(curr_username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email from auth'})
        return 
    }
    // check in db
    db.verifyinfo({username:curr_username,password:curr_password})
    .then(({id})=>{
        // verified and try to get info form db
        db.getinfo({username:curr_username})
        .then((msg)=>{
            // return info as json
            res.status(200).json(msg)
        })
        .catch((err)=>{
            // counter an error
            // res.status(400).json()
            res.status(400).json({result:err})
        })
    })
    .catch((err)=>{
        // check if username does not exists or password is wrong
        // res.status(400).json()
        res.status(401).json({result: err})
    })
})

app.post('/v2/user',(req,res)=>{
    // register account
    // get information from req.body
    let first_name
    let last_name 
    let password
    let username 
    try {
        first_name = req.body.first_name.trim()
        last_name = req.body.last_name.trim()
        password = req.body.password.trim()
        username = req.body.username.trim()
    } catch (error) {
        res.status(400).json({result:"Missing value from input"})
        return
    }

    // check if user input empty string
    if ( !first_name|| !last_name || !password|| !username){
        // res.status(400).json()
        res.status(400).json({result: 'Empty Input'})
        return
    }
    // check if the format of email is valid
    if (!help.validateEmail(username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email'})
        return 
    }
    // check the strength of password
    if (!help.validatePassword(password)){
        // res.status(400).json()
        res.status(400).json({result:'Simple Password. Upper and lower case letters and a number, length 8'})
        return
    }
    // everything is ok, ready to insert
    // since I set username(email) as PK in my database
    // I do not need to recheck if username is duplicated
    // mysql will return an errror if exists
    db.insertinfo({first_name,last_name, username, password})
    .then(()=>{
        // get info from db
        db.getinfo({username})
        .then((msg)=>{
            // return msg as json
            res.status(201).json(msg)
        })
        .catch((err)=>{
            // error
            // res.status(400).json()
            res.status(400).json({result:err})
        })
    })
    .catch((err)=>{
        // get if error on insertion
        // res.status(400).json()
        res.status(400).json({result:err})
    })
})

app.put('/v2/user/self',(req,res)=>{
    // update info
    // check if auth
    const auth = req.headers.authorization
    if (!auth){
        // res.status(401).json()
        res.status(401).json({Result:'No auth'})
        return;
    }
    // decode from auth
    const username_password = Buffer.from(auth.split(' ')[1],'base64').toString().split(':')
    const curr_username = username_password[0].trim()
    const curr_password = username_password[1].trim()

    // check if empty input
    if (!curr_username || !curr_password ){
        // res.status(400).json()
        res.status(400).json({Result:'Empty Input from auth'})
        return;
    }
    // validate the format of username
    if (!help.validateEmail(curr_username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email from auth'})
        return 
    }

    //check if exist in db
    db.verifyinfo({username:curr_username ,password:curr_password})
    .then(()=>{
        //verified
        // check the req.body, only allowed firstname, lastname, password and username
        const flag = Object.keys(req.body).filter(function(value){
            if (! [ 'first_name', 'last_name', 'password', 'username' ].includes(value)){
                return value
            }
        })
        if (flag.length > 0) {
            // res.status(400).json()
            res.status(400).json({result: 'Invalid Input from request'})
            return 
        }
            
        // get information from req.body
        let first_name_update
        let last_name_update
        let password_update
        let username_update
        try {
            first_name_update = req.body.first_name.trim()
            last_name_update = req.body.last_name.trim()
            password_update = req.body.password.trim()
            username_update = req.body.username.trim()
        } catch (error) {
            // res.status(400).json()
            res.status(400).json({result:"Missing value from request"})
            return
        }
        // no empty
        if ( !first_name_update|| !last_name_update || !password_update|| !username_update){
            // res.status(400).json()
            res.status(400).json({result: 'Empty Input'})
            return
        }
        // only allowed to update own information
        if (username_update !== curr_username ){
            // res.status(400).json()
            res.status(400).json({result:"Invalid update - email"})
            return
        }
        // check the strength of password
        if (!help.validatePassword(password_update)){
            // res.status(400).json()
            res.status(400).json({result:'Simple Password. Upper and lower case letters and a number, length 8'})
            return
        }
        //update in db
        db.updateinfo({username:curr_username,password:password_update,first_name:first_name_update,last_name:last_name_update,password_status: curr_password === password_update})
        .then(()=>{
            res.status(204).json()
        })
        .catch((err)=>{
            // res.status(400).json()
            res.status(400).json({result:err})
        })
    })
    .catch((err)=>{
        // res.status(400).json()
        res.status(400).json({result:err})
    })
})

// app.use(bodyParser.raw())

app.post("/v2/user/self/pic",(req,res)=>{

    // check if auth
    const auth = req.headers.authorization
    if (!auth){
        // res.status(401).json()
        res.status(401).json({Result:'No auth'})
        return;
    }
    // decode from auth
    const username_password = Buffer.from(auth.split(' ')[1],'base64').toString().split(':')
    const curr_username = username_password[0].trim()
    const curr_password = username_password[1].trim()

    // check if empty input
    if (!curr_username || !curr_password ){
        // res.status(400).json()
        res.status(400).json({Result:'Empty Input from auth'})
        return;
    }
    // validate the format of username
    if (!help.validateEmail(curr_username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email from auth'})
        return 
    }
    db.verifyinfo({username:curr_username,password:curr_password})
    .then(({id})=>{
        const encodeimage = req.body;
        if (!encodeimage.length){
            res.status(400).json({result: 'no image file'})
            return 
        }
        const user_id = id
        const extension = mime.extension(req.headers['content-type'])
        const file_name = `profile.${extension}`
        db.insertimage({file_name,user_id})
        .then((user_id)=>{
            db.getimage({user_id})
            .then((result)=>{
                const path = result[0].url
                aws_s3.uploadfile({path,encodeimage})
                .then(()=>{
                    res.status(201).json(result[0])
                })
                .catch(()=>{
                    res.status(400).json(null)
                })
            })
            .catch((err)=>{
                res.status(400).json({result:err})
            })
        })
        .catch((err)=>{
            // res.status(400).json()
            res.status(400).json({result:err})
        })
    })
    .catch((err)=>{
        // res.status(400).json()
        res.status(401).json({result:err})
    })
})

app.get("/v2/user/self/pic",(req,res)=>{
    // check if auth
    const auth = req.headers.authorization
    if (!auth){
        // res.status(401).json()
        res.status(401).json({Result:'No auth'})
        return;
    }
    // decode from auth
    const username_password = Buffer.from(auth.split(' ')[1],'base64').toString().split(':')
    const curr_username = username_password[0].trim()
    const curr_password = username_password[1].trim()

    // check if empty input
    if (!curr_username || !curr_password ){
        // res.status(400).json()
        res.status(400).json({Result:'Empty Input from auth'})
        return;
    }
    // validate the format of username
    if (!help.validateEmail(curr_username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email from auth'})
        return 
    }
    db.verifyinfo({username:curr_username,password:curr_password})
    .then(({id})=>{
        const user_id = id
        db.getimage({user_id})
        .then((result)=>{
            // console.log(result)
            res.status(200).json(result[0])
        })
        .catch((err)=>{
            // res.status(400).json()
            res.status(404).json({result:err})
        })
    })
    .catch((err)=>{
        // res.status(400).json()
        res.status(401).json({result:err})
    })
})

app.delete("/v2/user/self/pic",(req,res)=>{
    // check if auth
    const auth = req.headers.authorization
    if (!auth){
        // res.status(401).json()
        res.status(401).json({Result:'No auth'})
        return;
    }
    // decode from auth
    const username_password = Buffer.from(auth.split(' ')[1],'base64').toString().split(':')
    const curr_username = username_password[0].trim()
    const curr_password = username_password[1].trim()

    // check if empty input
    if (!curr_username || !curr_password ){
        // res.status(400).json()
        res.status(400).json({Result:'Empty Input from auth'})
        return;
    }
    // validate the format of username
    if (!help.validateEmail(curr_username)){
        // res.status(400).json()
        res.status(400).json({result: 'Invalid Email from auth'})
        return 
    }
    db.verifyinfo({username:curr_username,password:curr_password})
    .then(({id})=>{
        const user_id = id
        db.deleteimage({user_id})
        .then((result)=>{
            const url = result[0][0].url
            aws_s3.deletefile(url)
            .then(()=>{
                res.status(204).json(null)
            })
            .catch((err)=>{
                res.status(404).json({result:err})
            })
        })
        .catch((err)=>{
            // res.status(400).json()
            res.status(404).json({result:err})
        })
    })
    .catch((err)=>{
        // res.status(400).json()
        res.status(401).json({result:err})
    })
})


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
});