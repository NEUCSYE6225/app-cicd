const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const saltRounts = 10
const uuid = require('uuid').v4
// const {Sequelize,DataTypes} = require('sequelize');
const result = require('dotenv').config()

const db_username = process.env.DATABASE_username
const db_password= process.env.DATABASE_password
const db_host = process.env.DATABASE_host
const db_name = process.env.DATABASE_name
const bucket_name = process.env.Bucket_name
    // console.log(db_username,db_password,db_host,db_name)
    // console.log(db_host.split(":")[0])

const connection = mysql.createConnection({
    multipleStatements: true,
    host     : db_host.split(":")[0],
    user     : db_username,
    password : db_password,
    database: db_name
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
const user_sql = `CREATE TABLE IF NOT EXISTS User (
                id varchar(45) NOT NULL,
                first_name varchar(45) NOT NULL,
                last_name varchar(45) NOT NULL,
                password varchar(1000) NOT NULL,
                username varchar(45) NOT NULL,
                account_created datetime NOT NULL,
                account_updated datetime NOT NULL,
                PRIMARY KEY (username)
            )`;
connection.query(user_sql, function (err, result) {
    if (err) throw err;
    console.log("User table created");
});
const  image_sql = `CREATE TABLE IF NOT EXISTS Image (
    file_name varchar(100) DEFAULT NULL,
    id varchar(100) NOT NULL,
    url varchar(200) DEFAULT NULL,
    upload_date date DEFAULT NULL,
    user_id varchar(100) NOT NULL,
    PRIMARY KEY (user_id)
  )`;
connection.query(image_sql, function (err, result) {
    if (err) throw err;
    console.log("Image table created");
}); 


function insertinfo ({first_name,last_name, username, password}){
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
                reject(err.code.toString())
            }
            //ok
            else{
                resolve(result)
            }
        })
    })
}

function verifyinfo({username, password}){
    // sql command
    const sql = `
                select count(*)as count, password as hash ,id from User
                where username = '${username}'
                `
    return new Promise(function (resolve,reject){
        connection.query(sql, function(err,result) {
            //error
            if (err){
                reject(err.code.toString())
            }
            else{
                // if count == 0 => no user
                if (result[0].count === 0){
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
                            resolve({id})
                        }
                        else{
                            //reject
                            reject("Invalid Password")
                        }
                    })
                }
            }
        })
    })
}

function getinfo ({username}) {
    // sql command
    const sql = `
                select id,first_name,last_name,username,account_created,account_updated from User
                where username = '${username}'
                `
    return new Promise(function (resolve, reject){
        connection.query(sql, function (err,result){
            // error
            if (err){
                reject(err.code.toString())
            }
            else{
                // get info
                const {id,first_name,last_name,username,account_created,account_updated} = result[0]
                // return
                resolve({id,first_name,last_name,username,account_created,account_updated})
            }
        })
    })
}

function updateinfo ({first_name,last_name, username, password,password_status}){
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
                reject(err.code.toString())
            }
            else{
                resolve(result)
            }
        })
    })
}


function insertimage({file_name,user_id}){
    // console.log("Insert image")
    // console.log({file_name,user_id})
    const id = uuid()
    const url = `${bucket_name}/${user_id}/${file_name}`
    const sql = `insert into Image (file_name, id, url,upload_date,user_id)
                values ('${file_name}','${id}','${url}',date(now()),'${user_id}')`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            //error
            if (err){
                reject(err.code.toString())
            }
            //ok
            else{
                // console.log(result)
                resolve(user_id)
            }
        })
    })
}

function getimage({user_id}){
    const sql = `select file_name, id, url, DATE_FORMAT(upload_date, '%Y-%m-%d') as upload_date,user_id from Image
                where user_id = '${user_id}'`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            //error
            // console.log(result)
            if (err){
                reject(err.code.toString())
            }
            if (!result.length){
                reject ("empty")
            }
            else{
                resolve(result)
            }
        })
    })
}

function deleteimage({user_id}){
    const sql = `select * from Image where user_id = '${user_id}';
                delete from Image where user_id = '${user_id}'`
    return new Promise (function (resolve,reject){
        connection.query(sql, function(err,result){
            // console.log(result.affectedRows)
            //error
            if (err){
                reject(err.code.toString())
            }
            else if (result[1].affectedRows === 0){
                reject("Not Found")
            }
            else{
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

