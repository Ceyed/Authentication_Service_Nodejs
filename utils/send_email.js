const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config()

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

async function sendEmail(receiver, validationLink, forgotPassword = false) {
    try {
        // * Define access token for oAuth
        const accessToken = await oAuth2Client.getAccessToken()

        // *  Set general configs for sending email
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false,
            },
            auth: {
                type: 'OAuth2',
                user: 'SENDER_EMAIL@gmail.com',                             // TODO: Change 'SENDER_EMAIL@gmail.com'
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        })

        let baseMessage
        let emailSubject
        let code
        if (forgotPassword) {
            emailSubject = 'Reset Password'
            baseMessage = '<h3> Hello There <br> Please choose one option to reset your password:'
            code = validationLink.split('&reset_code=')[1]
        }
        else {
            emailSubject = 'Please confirm your email account'
            baseMessage = '<h3> Hello There <br> Please choose one option to validate your email:'
            code = validationLink.split('&validation_code=')[1]
        }

        // * Set individual email options
        const mailOptions = {
            from: 'Ceyed <noreply@gmail.com>',                              // TODO: Change 'Ceyed <noreply@gmail.com>'
            to: receiver,
            subject: emailSubject,
            html: baseMessage + '<br>1. <a href=' + validationLink + '>Click here to validate</a><br>2. Enter this code: </h3><h2>' + code + '</h2><br><h3> Respectfully <br> Ceyed | https://github.com/Ceyed <br></h3>'
        }

        // * Send email
        const result = await transport.sendMail(mailOptions)
        return result
    }
    catch (error) {
        return error
    }
}


module.exports = {
    sendEmail,
}
