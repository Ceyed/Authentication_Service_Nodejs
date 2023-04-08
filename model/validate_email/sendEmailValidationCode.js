const { emailRegexValidation } = require('../../utils/regexValidation')
const { emailAlreadyValidated, saveEmailCodeToDB } = require('../database')
const { sendEmail } = require('../../utils/send_email')


async function sendEmailValidationCode(request, response) {
    try {
        const { email } = request.body

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        if (emailRegexResult == false) {
            return response.status(401).send('Validation code didn\'t send')
        }

        // * Check if email already validated
        if (await emailAlreadyValidated(email) == true) {
            return response.status(200).send('Validation code sended. Check your email')
        }

        // * Creating and saving random number in database
        const randomNumber = await saveEmailCodeToDB(email)
        if (randomNumber == false) {
            response.send('Error: Couldn\'t send email')
            return response.status(402).send('Validation code didn\'t send')
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/validate_email?email=' + email + '&validation_code=' + randomNumber

        // * Email validation link to user
        await sendEmail(email, link)
            .then((result) => response.status(200).send('Validation code sended. Check your email'))
            .catch((error) => response.status(403).send('Validation code didn\'t send'))
    }
    catch (error) {
        // console.log(error)
        // return response.status(404).send('Validation code didn\'t send')
        return false
    }
}


module.exports = {
    sendEmailValidationCode,
}