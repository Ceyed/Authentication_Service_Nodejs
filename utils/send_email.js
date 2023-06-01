const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config()
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

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

        // * Point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/'),
        };

        // * Use a template file with nodemailer
        transport.use('compile', hbs(handlebarOptions))

        let emailText
        let emailSubject
        let code = ''
        let buttonText
        let emailTitle
        if (forgotPassword) {
            emailSubject = 'Reset password'
            buttonText = 'Reset Password'
            emailTitle = 'Thanks for reaching us!'
            emailText = 'Please click link bellow to change your password'
        }
        else {
            emailSubject = 'Please confirm your email account'
            buttonText = 'Verify Email Now'
            emailTitle = 'Thanks for signing up!'
            code = validationLink.split('&validation_code=')[1]
            emailText = 'We are happy you signed up. To start working, please confirm your email address'
        }

        // * Set individual email options
        const mailOptions = {
            from: 'Ceyed <noreply@gmail.com>',                              // TODO: Change 'Ceyed <noreply@gmail.com>'
            to: receiver,
            subject: emailSubject,
            template: 'email',
            context: {
                verification_link: validationLink,
                email_text: emailText,
                button_text: buttonText,
                validation_code: code,
                email_title: emailTitle,
            }
        }

        // * Send email
        // const result = await transport.sendMail(mailOptions)
        // console.log(result)
        // return result
        return await transport.sendMail(mailOptions)
    }
    catch (error) {
        // console.log(error)
        return false
    }
}


module.exports = {
    sendEmail,
}