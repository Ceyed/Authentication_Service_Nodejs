const { giveMeValidationCode, validateEmail } = require('../model/database')
const { emailRegexValidation, emailCodeRegexValidation } = require('../utils/regexValidation')


async function validateEmailAddress(request, response, userEmail, inputValidationCode) {
    try {
        // * Regex validation
        const emailRegexResult = await emailRegexValidation(userEmail)
        const codeRegexResult = await emailCodeRegexValidation(inputValidationCode)
        if (emailRegexResult == false || codeRegexResult == false) {
            // response.status(400).send(`Error in email validation, Email or code is wrong`)
            return false
        }

        // * Read saved validation code in database
        const savedValidationCode = await giveMeValidationCode(userEmail)
        if (savedValidationCode == false) {
            // * Email not founded
            // response.status(400).send(`Error in email validation, Email or code is wrong`)
            return false
        }

        // * Check saved validation code to given validation code
        if (savedValidationCode == inputValidationCode) {
            // * Activate email
            if (await validateEmail(userEmail) == true) {
                return true
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }
    catch (error) {
        // console.log(error)
        // response.send('Error 11: Unexpected error accrued. Please contact admin')
        return false
    }
}

module.exports = {
    validateEmailAddress,
}
