const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { emailRegexValidation } = require('../../utils/regexValidation')
// const { emailAlreadyValidated, saveEmailCodeToDB } = require('../database')
const { sendEmail } = require('../../utils/send_email')


async function sendEmailValidationCode(request, response) {
    try {
        const { email } = request.body

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        if (emailRegexResult == false) {
            return response.status(401).json('Validation code didn\'t send')
        }

        // * Check if email already validated
        const emailAlreadyValidated = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                validated: true,
                email_validation_code: true,
            }
        })

        if (emailAlreadyValidated.validated == true) {
            return response.status(200).json('Email is already validated')
        }

        // TODO: Recreating email_validation_code ? [Not now, Maybe later or when you are reading it Saeed :| ]
        // TODO: AND maybe it should be deleted after validation ?

        // * Creating validation link to email it
        const host = request.header('host')
        const link = 'http://' + host + '/api/v1/validate_email?email=' + email + '&validation_code=' + emailAlreadyValidated.email_validation_code

        // * Email validation link to user
        var sendEmailResponse
        if (await sendEmail(email, link)) {
            sendEmailResponse = 'We will send email if there is any account registered with this email'
        }
        else {
            sendEmailResponse = 'An error accrued during sending email, Please try again'
        }

        if (!request.silenceResponse) {
            return response.status(200).json(sendEmailResponse)
        }
        else {
            return
        }
    }
    catch (error) {
        // console.log(error)
        // return response.status(404).json('Validation code didn\'t send')
        return false
    }
}


module.exports = {
    sendEmailValidationCode,
}
