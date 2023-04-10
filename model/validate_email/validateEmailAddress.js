const { giveMeValidationCode, validateEmail } = require('../database')
const { emailRegexValidation, emailCodeRegexValidation } = require('../../utils/regexValidation')


async function validateEmailAddress(request, response, method) {
    try {
        var email
        var validation_code
        if (method == 'post') {
            email = request.body.email
            validation_code = request.body.validationCode
        }
        else {
            email = request.query.email
            validation_code = request.query.validation_code
        }

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        const codeRegexResult = await emailCodeRegexValidation(validation_code)
        if (emailRegexResult == false || codeRegexResult == false) {
            return response.status(400).json('Invalid email or validation code')
        }

        // * Read saved validation code in database
        const savedValidationCode = await giveMeValidationCode(email)
        if (savedValidationCode == false) {
            // * Email not founded
            return response.status(400).json('Email didn\'t validate')
        }

        // * Check saved validation code to given validation code
        if (savedValidationCode == validation_code) {
            // * Activate email
            if (await validateEmail(email) == true) {
                return response.status(200).json('Email validated')
            }
            else {
                return response.status(400).json('Email didn\'t validate')
            }
        }
        else {
            return response.status(400).json('Email didn\'t validate')
        }
    }
    catch (error) {
        // console.log(error)
        // return response.status(400).json('Email didn\'t validate')
        return false
    }
}

module.exports = {
    validateEmailAddress,
}
