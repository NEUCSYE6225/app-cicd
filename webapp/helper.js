const db = require('./database')
const validateEmail = function(email) {
    const re = /\S+@\S+\.\S+/;
    // console.log(re.test(email))
    return re.test(email);
}

const validatePassword = function(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    return re.test(password)
}

module.exports = {
    validateEmail,
    validatePassword
}
// validateEmail("abcd")
// validateEmail("abcd@abc.com")
// console.log(validatePassword('a'))
// console.log(validatePassword('1'))
// console.log(validatePassword('1Ac'))
// console.log(validatePassword('aaaaaaaa'))
// console.log(validatePassword('12345678'))
// console.log(validatePassword('abc45678'))
// console.log(validatePassword('aBc12345'))


db.insertinfo ({first_name:'aaa',last_name:'aaa', username:'abccccc', password:'123'})
.then((result)=>{
    console.log(result)
})
.catch((err)=>{
    console.log("err:"+err)
})
// db.getinfo({username:'abc'})