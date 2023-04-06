const { saveCodeToDB, emailAlreadyValidated } = require('../model/db')
const { sendEmail } = require('../utils/send_email')
const { emailRegexValidation } = require('./regexValidation')


async function sendCode(request, response, userEmail) {
    try {
        // * Regex validation
        const emailRegexResult = await emailRegexValidation(userEmail)
        if (emailRegexResult == false) {
            response.send('Error: Can not send email. Make sure your email address is valid');
            return false
        }

        // // * Check if email already validated
        // if (await emailAlreadyValidated(userEmail) == true) {
        //     response.send('Email already activated')
        //     return false
        // }

        // * Creating and saving random number in database
        const randomNumber = await saveCodeToDB(userEmail)
        if (randomNumber == false) {
            response.send('Error: Couldn\'t send email')
            return false
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/validate?email=' + userEmail + '&validation_code=' + randomNumber

        // * Email validation link to user
        await sendEmail(userEmail, link)
            .then((result) => response.send('Email sent'))
            .catch((error) => response.send('Error: Couldn\'t send email'))
    }
    catch (error) {
        // console.log(error)
        response.send('Error 10: Unexpected error accrued. Please contact admin')
        return false
    }
}


module.exports = {
    sendCode,
}
