helper = require("../webapp/helper")
const assert = require('assert');

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

