const { giveMeValidationCode, validateEmail } = require('../model/db')
const { emailRegexValidation, codeRegexValidation } = require('./regexValidation')


async function validateCode(request, response) {
    try {
        // * Read email and validate code from url
        const userEmail = request.query.email
        const inputValidationCode = request.query.validation_code.toString()

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(userEmail)
        const codeRegexResult = await codeRegexValidation(inputValidationCode)
        if (emailRegexResult == false || codeRegexResult == false) {
            response.send(`Error in email validation, Email or code is wrong`)
            return false
        }

        // * Read saved validation code in database
        const savedValidationCode = await giveMeValidationCode(userEmail)
        if (savedValidationCode == null) {
            // * Email not founded
            response.send(`Error in email validation, Email or code is wrong`)
            return false
        }
        else {
            // * Check saved validation code to given validation code
            if (savedValidationCode == inputValidationCode) {
                // * Activate email
                if (await validateEmail(userEmail) == true) {
                    response.send(`The email ${userEmail} has got validate`)
                    return true
                }
                else {
                    response.send(`Error in email validation, Email or code is wrong`)
                    return false
                }
            }
            else {
                response.send(`Error in email validation, Email or code is wrong`)
                return false
            }
        }
    }
    catch (error) {
        console.log(error)
        response.send('Error 11: Unexpected error accrued. Please contact admin')
        return false
    }
}

module.exports = {
    validateCode,
}
