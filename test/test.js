helper = require("../webapp/helper")
const assert = require('assert');
helper.validateEmail("abcd")
helper.validateEmail("abcd@abc.com")
console.log(helper.validatePassword('a'))
console.log(helper.validatePassword('1'))
console.log(helper.validatePassword('1Ac'))
console.log(helper.validatePassword('aaaaaaaa'))
console.log(helper.validatePassword('12345678'))
console.log(helper.validatePassword('abc45678'))
console.log(helper.validatePassword('aBc12345'))

describe("Validate Email", () => {
    it('catch invalid email', () => {
        if (helper.validateEmail("abcd") == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('only pass with a valid email', () => {
        if (helper.validateEmail("abcd@abc.com") == true) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
})

describe("Validate password", () => {
    it('catch invalid password', () => {
        if (helper.validatePassword('a') == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('catch invalid password', () => {
        if (helper.validatePassword('1')== false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('catch invalid password', () => {
        if (helper.validatePassword('1Ac') == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('catch invalid password', () => {
        if (helper.validatePassword('aaaaaaaa') == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('catch invalid password', () => {
        if (helper.validatePassword('12345678') == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('catch invalid password', () => {
        if (helper.validatePassword('abc45678') == false) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
    it('only pass with a valid password', () => {
        if (helper.validatePassword('aBc12345') == true) {
            assert(true); 
        }
        else { 
            assert(false); 
        }
    })
})

