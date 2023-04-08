const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

function emailRegexValidation(email) {
    if (!email)
        return false

    if (email.length > 254)
        return false

    var valid = emailRegex.test(email)
    if (!valid)
        return false

    // Further checking of some things regex can't handle
    var parts = email.split('@')
    if (parts[0].length > 64)
        return false

    var domainParts = parts[1].split('.')
    if (domainParts.some(function (part) { return part.length > 63 }))
        return false

    return true
}


const validateCodeRegex = /\d{8}$/

function emailCodeRegexValidation(validateCode) {
    if (!validateCode)
        return false

    return validateCodeRegex.test(validateCode)
}


const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/

function strongPasswordRegexValidation(password) {
    if (!password)
        return false

    return strongPasswordRegex.test(password)
}



module.exports = {
    emailRegexValidation,
    emailCodeRegexValidation,
    strongPasswordRegexValidation,
}
