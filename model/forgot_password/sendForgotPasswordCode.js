const { findUser, saveForgotPasswordCodeToDB } = require('../database')
const { sendEmail } = require('../../utils/send_email')


async function sendForgotPasswordCode(request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)

        // * Creating and saving random number in database
        const randomNumber = await saveForgotPasswordCodeToDB(user.email)
        if (randomNumber == false) {
            return response.status(400).json('An error accrued during sending email, Please try again')
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/new_password?email=' + user.email + '&reset_code=' + randomNumber

        // * Email validation link to user
        await sendEmail(user.email, link, true)
            .then((result) => response.status(200).json('Reset code sended. Please check your email'))
            .catch((error) => response.status(400).json('An error accrued during sending email, Please try again'))
    }
    catch (error) {
        // console.log(error)
        // return response.status(400).json('An error accrued during sending email, Please try again')
        return false
    }
}


module.exports = {
    sendForgotPasswordCode,
}
