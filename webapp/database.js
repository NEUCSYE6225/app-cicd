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
    dialectOptions: {
        ssl:'Amazon RDS'
    },
    define: {
        freezeTableName: true,
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    },
    logging: false,
    port: 3306,
    replication: {
        read: [
            {host: db_read_replica.split(":")[0], username: db_username, password: db_password}
        ],
        write: { host: db_host.split(":")[0], username: db_username, password: db_password}
    },
    pool: {
        max: 20,
        idle: 30000
    },
})

const User = sequelize.define('User',{
    id :{
        type:DataTypes.STRING,
        allowNull:false
    },
    first_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    last_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey: true 
    },
    account_created:{
        type:Sequelize.DATE,
        allowNull:false
    },
    account_updated:{
        type:Sequelize.DATE,
        allowNull:false
    },
    verified:{
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
        defaultValue: false
    },
    verified_on:{
        type:Sequelize.DATE,
    }
})


const Image = sequelize.define('Image',{
    file_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    id:{
        type:DataTypes.STRING,
        allowNull:false
    },
    url:{
        type:DataTypes.STRING,
        allowNull:false
    },
    upload_date:{
        type:Sequelize.DATE,
    },
    user_id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey: true 
    }
})

async function createTables(){
    await sequelize.sync()
}
createTables()


function insertinfo ({first_name,last_name, username, password}){
    const start = Date.now()
    // get uuid 
    const id = uuid()
    // get hash
    const hash = bcrypt.hashSync(password, saltRounts);
    // sql command

    return new Promise (function (resolve, reject) {
        User.create({
            id: id,
            first_name:first_name,
            last_name:last_name,
            password:hash,
            username:username,
            account_created:new Date(),
            account_updated:new Date()
        })
        .then((result)=>{
            aws_sdc.timing("db-insertinfo",Date.now() - start)
            resolve(result)
        })
        .catch((err)=>{
            aws_sdc.timing("db-insertinfo",Date.now() - start)
            reject(err.original.code)
        })
    })
}

function verifyinfo({username, password}){
    const start = Date.now()
    return new Promise (function(resolve,reject){
        User.findAndCountAll({
            where:{
                username:username
            }
        })
        .then((result)=>{
            // console.log(result.rows[0].dataValues)
            if (result.count == 0){
                aws_sdc.timing("db-verifyinfo",Date.now() - start)
                reject("Username doesn't exist")
            }
            else{
                const verified = result.rows[0].dataValues.verified
                if (!verified){
                    aws_sdc.timing("db-verifyinfo",Date.now() - start)
                    reject(`${result.rows[0].dataValues.username} is not verified`)
                }
                else{
                    const id = result.rows[0].dataValues.id
                    const hash = result.rows[0].dataValues.password
                    bcrypt.compare(password,hash)
                    .then((result)=>{
                        if (result){
                            aws_sdc.timing("db-verifyinfo",Date.now() - start)
                            resolve({id})
                        }
                        else{
                            aws_sdc.timing("db-verifyinfo",Date.now() - start)
                            reject("Invalid Password")
                        }
                    })
                }
            }
        })
        .catch((err)=>{
            aws_sdc.timing("db-verifyinfo",Date.now() - start)
            reject(err.original.code)
        })
    })
}

function getinfo ({username}) {
    const start = Date.now()
    return new Promise(function (resolve, reject){
        User.findOne({
            where:{
                username:username
            }
        })
        .then((result)=>{
            const id = result.dataValues.id
            const first_name = result.dataValues.first_name
            const last_name = result.dataValues.last_name
            const username = result.dataValues.username
            const account_created = result.dataValues.account_created
            const account_updated = result.dataValues.account_updated
            const verified = result.dataValues.verified
            const verified_on = result.dataValues.verified_on
            aws_sdc.timing("db-getinfo",Date.now() - start)
            resolve({id,first_name,last_name,username,account_created,account_updated,verified,verified_on})
        })
        .catch((err)=>{
            aws_sdc.timing("db-getinfo",Date.now() - start)
            reject(err.original.code)
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
        sql = {
            first_name: first_name,
            last_name:last_name,
            password:hash,
            account_updated: new Date()
        }
    } 
    else{
        sql = {
            first_name: first_name,
            last_name:last_name,
            account_updated: new Date()
        }
    }
    return new Promise(function (resolve,reject){
        User.update(sql,
        {
            where: {
                username:username
            }
        })
        .then((result)=>{
            aws_sdc.timing("db-updateinfo",Date.now() - start)
            resolve(result)
        })
        .catch((err)=>{
            aws_sdc.timing("db-updateinfo",Date.now() - start)
            reject(err.original.code)
        })
    })
}

function updateauth({username}){
    const start = new Date()
    const sql = {
        verified: true,
        verified_on: new Date()
    }
    return new Promise(function(resolve,reject){
        User.update(sql,{
            where:{
                username:username
            }
        })
        .then(()=>{
            resolve(`${username} has been activated`)
        })
        .catch((err)=>{
            reject(err)
        })
    })
}

function insertimage({file_name,user_id}){
    const start = Date.now()
    const id = uuid()
    const url = `${bucket_name}/${user_id}/${file_name}`
    return new Promise (function (resolve,reject){
        Image.create({
            file_name:file_name,
            id:id,
            url:url,
            upload_date:new Date(),
            user_id:user_id
        })
        .then(()=>{
            aws_sdc.timing("db-insertimage",Date.now() - start)
            resolve(user_id)
        })
        .catch((err)=>{
            aws_sdc.timing("db-insertimage",Date.now() - start)
            reject(err.original.code)
        })
    })
}

function getimage({user_id}){
    const start = Date.now()
    return new Promise (function (resolve,reject){
        Image.findAndCountAll({
            where:{
                user_id:user_id
            }
        })
        .then((result)=>{
            if (result.count === 0){
                aws_sdc.timing("db-getimage",Date.now() - start)
                reject ("empty")
            }
            else{
                aws_sdc.timing("db-getimage",Date.now() - start)
                resolve(result.rows)
            }
        })
        .catch((err)=>{
            aws_sdc.timing("db-getimage",Date.now() - start)
            reject(err.original.code)
        })
    })
}


function deleteimage({user_id}){
    const start = Date.now()
    return new Promise (function (resolve,reject){
        Image.findAndCountAll({
            where:{
                user_id:user_id
            }
        })
        .then((result)=>{
            if (result.count === 0){
                reject ("empty")
            }
            else{
                const url = result.rows[0].dataValues.url
                Image.destroy({
                    where:{
                        user_id:user_id
                    }
                })
                .then((result)=>{
                    if (result === 0){
                        aws_sdc.timing("db-deleteimage",Date.now() - start)
                        reject("Not Found")
                    }
                    else{
                        aws_sdc.timing("db-deleteimage",Date.now() - start)
                        resolve({url})
                    }
                })
                .catch((err)=>{
                    aws_sdc.timing("db-getimage",Date.now() - start)
                    reject(err.original.code)
                })
            }
        })
        .catch((err)=>{
            reject(err.original.code)
        })
    })
}

async function get_performance_schema(){
    const sql = `
        SELECT id, user, host, connection_type 
        FROM performance_schema.threads pst 
        INNER JOIN information_schema.processlist isp 
        ON pst.processlist_id = isp.id; 
    `
    return await sequelize.query(sql)
}

module.exports = {
    insertinfo,
    getinfo,
    verifyinfo,
    updateinfo,
    insertimage,
    getimage,
    deleteimage,
    updateauth,
    get_performance_schema
}

