const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
// var crypto = require("crypto")
const jwt = require('jsonwebtoken')

const { sendEmail } = require('../../utils/send_email')


function getTime() {
    try {
        var datetime = new Date()
        var dateString = new Date(
            datetime.getTime() - ((-270) * 60000)
        )
        var curr_time = dateString.toISOString().replace("T", " ").substr(0, 19)
        return curr_time
    }
    catch (error) {
        respond.json(`ERROR IN GETTIME: ${error}`)
        return false
    }
}


async function sendForgotPasswordCode(request, response) {
    try {
        const { email } = request.body

        // * Creating and saving reset token in database
        const resetToken = jwt.sign(
            {
                email: email,
                created_at: await getTime(),
                // resetTokenCrypto: crypto.randomBytes(32).toString('hex'),
            },
            process.env.FORGOT_TOKEN_KEY,
            {
                expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_TIME,
            }
        )

        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                reset_password_token: resetToken,
            }
        })

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/confirm?reset_token=' + resetToken                                            // TODO: Update url

        // * Email validation link to user
        if (await sendEmail(email, link, true)) {
            response.status(200).json('We will send email if there is any account registered with this email')
        }
        else {
            response.status(400).json('An error accrued during sending email, Please try again')
        }
    }
    catch (error) {
        // console.log(error)
        return response.status(400).json('An error accrued during sending email, Please try again')
    }
}


module.exports = {
    sendForgotPasswordCode,
}
