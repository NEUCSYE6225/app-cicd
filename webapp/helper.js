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