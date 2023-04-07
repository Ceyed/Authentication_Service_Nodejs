const { saveForgotPasswordCodeToDB } = require('./database')
const { sendEmail } = require('../utils/send_email')


async function sendForgotPasswordCode(request, response, userEmail) {
    try {
        // * Creating and saving random number in database
        const randomNumber = await saveForgotPasswordCodeToDB(userEmail)
        if (randomNumber == false) {
            response.send('Error: Couldn\'t send email')
            return false
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/new_password?email=' + userEmail + '&reset_code=' + randomNumber

        // * Email validation link to user
        var sendEmailResponse = null
        await sendEmail(userEmail, link, true)
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
    sendForgotPasswordCode,
}
