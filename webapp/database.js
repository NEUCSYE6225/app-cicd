const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const saltRounts = 10
const uuid = require('uuid').v4
const {Sequelize,DataTypes} = require('sequelize');
const result = require('dotenv').config()
const SDC = require('statsd-client');
const aws_sdc = new SDC()

const db_username = process.env.DATABASE_username
const db_password= process.env.DATABASE_password
const db_host = process.env.DATABASE_host
const db_name = process.env.DATABASE_name
const db_read_replica = process.env.DATABASE_read_host
const bucket_name = process.env.Bucket_name

const sequelize = new Sequelize(db_name, null, null, {
    dialect: 'mysql',
    port: 3306,
    replication: {
        read: [
            {host: db_read_replica.split(":")[0], username: db_username, password: db_password}
        ],
        write: { host: db_host.split(":")[0], username: db_username, password: db_password}
    },
    pool: { // If you want to override the options used for the read/write pool you can do so here
        max: 20,
        idle: 30000
    },
})

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

// const user = sequelize.define('User',{
//     id :{},
//     first_name:{},
//     last_name:{},
//     password:{},
//     username:{},
//     account_created:{},
//     account_updated:{},
//     verified:{},
//     verified_on:{}
// })

// const connection = mysql.createConnection({
//     multipleStatements: true,
//     host     : db_host.split(":")[0],
//     user     : db_username,
//     password : db_password,
//     database: db_name
// })

// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("Main database is connected!");
// });

// const user_sql = `CREATE TABLE IF NOT EXISTS User (
//                 id varchar(45) NOT NULL,
//                 first_name varchar(45) NOT NULL,
//                 last_name varchar(45) NOT NULL,
//                 password varchar(1000) NOT NULL,
//                 username varchar(45) NOT NULL,
//                 account_created datetime NOT NULL,
//                 account_updated datetime NOT NULL,
//                 PRIMARY KEY (username))`;
// connection.query(user_sql, function (err, result) {
//     if (err) throw err;
//     console.log("User table created");
// });
// const  image_sql = `CREATE TABLE IF NOT EXISTS Image (
//     file_name varchar(100) DEFAULT NULL,
//     id varchar(100) NOT NULL,
//     url varchar(200) DEFAULT NULL,
//     upload_date date DEFAULT NULL,
//     user_id varchar(100) NOT NULL,
//     PRIMARY KEY (user_id))`;
// connection.query(image_sql, function (err, result) {
//     if (err) throw err;
//     console.log("Image table created");
// }); 


function insertinfo ({first_name,last_name, username, password}){
    const start = Date.now()
    // get uuid 
    const id = uuid()
    // get hash
    const hash = bcrypt.hashSync(password, saltRounts);
    // sql command
    const sql = `
        insert into User (id,first_name,last_name,password,username,account_created,account_updated)
        values ('${id}','${first_name}','${last_name}','${hash}','${username}',now(),now())
        `
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            //error
            if (err){
                aws_sdc.timing("db-insertinfo",Date.now() - start)
                reject(err.code.toString())
            }
            //ok
            else{
                aws_sdc.timing("db-insertinfo",Date.now() - start)
                resolve(result)
            }
        })
    })
}

function verifyinfo({username, password}){
    const start = Date.now()
    // sql command
    const sql = `
                select count(*)as count, password as hash ,id from User
                where username = '${username}'
                `
    return new Promise(function (resolve,reject){
        connection.query(sql, function(err,result) {
            //error
            if (err){
                aws_sdc.timing("db-verifyinfo",Date.now() - start)
                reject(err.code.toString())
            }
            else{
                // if count == 0 => no user
                if (result[0].count === 0){
                    aws_sdc.timing("db-verifyinfo",Date.now() - start)
                    reject("Username doesn't exist")
                }
                else{
                    // password comparsion
                    const id = result[0].id
                    const hash = result[0].hash
                    bcrypt.compare(password,hash)
                    .then (function(result){
                        if (result){
                            //ok
                            aws_sdc.timing("db-verifyinfo",Date.now() - start)
                            resolve({id})
                        }
                        else{
                            //reject
                            aws_sdc.timing("db-verifyinfo",Date.now() - start)
                            reject("Invalid Password")
                        }
                    })
                }
            }
        })
    })
}

function getinfo ({username}) {
    const start = Date.now()
    // sql command
    const sql = `
                select id,first_name,last_name,username,account_created,account_updated from User
                where username = '${username}'
                `
    return new Promise(function (resolve, reject){
        connection.query(sql, function (err,result){
            // error
            if (err){
                aws_sdc.timing("db-getinfo",Date.now() - start)
                reject(err.code.toString())
            }
            else{
                // get info
                const {id,first_name,last_name,username,account_created,account_updated} = result[0]
                // return
                aws_sdc.timing("db-getinfo",Date.now() - start)
                resolve({id,first_name,last_name,username,account_created,account_updated})
            }
        })
    })
}

function updateinfo ({first_name,last_name, username, password,password_status}){
    const start = Date.now()
    let sql
    // check if password is changed or not, update when something is changed
    if (!password_status){
        const hash = bcrypt.hashSync(password, saltRounts);
        // console.log(hash)
        sql = `
            update User
            set 
                first_name = '${first_name}',
                last_name = '${last_name}',
                password = '${hash}',
                account_updated = now()
            where username = '${username}' and (first_name <> '${first_name}' or last_name <> '${last_name}' or password <> '${hash}')  
            `
    } 
    else{
        sql = `
            update User
            set first_name = '${first_name}',
                last_name = '${last_name}',
                account_updated = now()
            where username = '${username}' and (first_name <> '${first_name}' or last_name <> '${last_name}' )  
            `
    }
    return new Promise(function (resolve,reject){
        connection.query(sql,function (err, result){
            if (err){
                aws_sdc.timing("db-updateinfo",Date.now() - start)
                reject(err.code.toString())
            }
            else{
                aws_sdc.timing("db-updateinfo",Date.now() - start)
                resolve(result)
            }
        })
    })
}


function insertimage({file_name,user_id}){
    const start = Date.now()
    const id = uuid()
    const url = `${bucket_name}/${user_id}/${file_name}`
    const sql = `insert into Image (file_name, id, url,upload_date,user_id)
                values ('${file_name}','${id}','${url}',date(now()),'${user_id}')`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            //error
            if (err){
                aws_sdc.timing("db-insertimage",Date.now() - start)
                reject(err.code.toString())
            }
            //ok
            else{
                // console.log(result)
                aws_sdc.timing("db-insertimage",Date.now() - start)
                resolve(user_id)
            }
        })
    })
}

function getimage({user_id}){
    const start = Date.now()
    const sql = `select file_name, id, url, DATE_FORMAT(upload_date, '%Y-%m-%d') as upload_date,user_id from Image
                where user_id = '${user_id}'`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            //error
            // console.log(result)
            if (err){
                aws_sdc.timing("db-getimage",Date.now() - start)
                reject(err.code.toString())
            }
            if (!result.length){
                aws_sdc.timing("db-getimage",Date.now() - start)
                reject ("empty")
            }
            else{
                aws_sdc.timing("db-getimage",Date.now() - start)
                resolve(result)
            }
        })
    })
}

function deleteimage({user_id}){
    const start = Date.now()
    const sql = `select * from Image where user_id = '${user_id}';
                delete from Image where user_id = '${user_id}'`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            // console.log(result.affectedRows)
            //error
            if (err){
                aws_sdc.timing("db-deleteimage",Date.now() - start)
                reject(err.code.toString())
            }
            else if (result[1].affectedRows === 0){
                aws_sdc.timing("db-deleteimage",Date.now() - start)
                reject("Not Found")
            }
            else{
                aws_sdc.timing("db-deleteimage",Date.now() - start)
                resolve(result)
            }
        })
    })
}
module.exports = {
    connection,
    insertinfo,
    getinfo,
    verifyinfo,
    updateinfo,
    insertimage,
    getimage,
    deleteimage
}

