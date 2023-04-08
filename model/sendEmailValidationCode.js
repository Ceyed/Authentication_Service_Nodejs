const { saveEmailCodeToDB, emailAlreadyValidated } = require('./database')
const { sendEmail } = require('../utils/send_email')


async function sendEmailValidationCode(request, response, userEmail) {
    try {
        // * Check if email already validated
        if (await emailAlreadyValidated(userEmail) == true) {                // TODO: Change function for new 'validate' column in 'users' table
            // response.send('Email already activated')
            return true
        }

        // * Creating and saving random number in database
        const randomNumber = await saveEmailCodeToDB(userEmail)
        if (randomNumber == false) {
            response.send('Error: Couldn\'t send email')
            return false
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/validate_email?email=' + userEmail + '&validation_code=' + randomNumber

        // * Email validation link to user
        var sendEmailResponse = null
        await sendEmail(userEmail, link)
            .then((result) => sendEmailResponse = true)
            .catch((error) => sendEmailResponse = false)

        return sendEmailResponse
    }
    catch (error) {
        // console.log(error)
        response.send('Error 10: Unexpected error accrued. Please contact admin')
        return false
    }
}


module.exports = {
    sendEmailValidationCode,
}
