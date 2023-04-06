const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config()

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

async function sendEmail(receiver, validationLink) {
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

        // * Set individual email options
        const mailOptions = {
            from: 'Ceyed <noreply@gmail.com>',                              // TODO: Change 'Ceyed <noreply@gmail.com>'
            to: receiver,
            subject: 'Please confirm your email account',
            html: '<h3> Hello There <br> Please click on the link bellow to validate your email: <br><a href=' + validationLink + '>Click here to validate</a><br><br> Respectfully <br> Ceyed | https://github.com/Ceyed <br></h3>'
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
