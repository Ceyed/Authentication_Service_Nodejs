var crypto = require("crypto")
const jwt = require('jsonwebtoken')

const { saveForgotPasswordCodeToDB } = require('../database')
const { sendEmail } = require('../../utils/send_email')


async function sendForgotPasswordCode(request, response) {
    try {
        const { email } = request.body

        // * Creating and saving reset token in database
        const resetToken = jwt.sign(
            {
                email: email,
                // resetTokenCrypto: crypto.randomBytes(32).toString('hex'),
            },
            process.env.FORGOT_TOKEN_KEY,
            {
                expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_TIME,
            }
        )

        if (await saveForgotPasswordCodeToDB(email, resetToken) == false) {
            return response.status(400).json('An error accrued during sending email, Please try again')
        }

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/confirm?reset_token=' + resetToken                                            // TODO: Update url

        // * Email validation link to user
        await sendEmail(email, link, true)
            .then((result) => response.status(200).json('We will send email if there is any account registered with this email'))
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
