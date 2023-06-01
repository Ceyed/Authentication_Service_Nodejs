const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { emailRegexValidation, emailCodeRegexValidation } = require('../../utils/regexValidation')


async function validateEmailAddress(request, response) {
    try {
        var email
        var validationCode
        if (request.method == "POST") {
            email = request.body.email
            validationCode = request.body.validationCode
        }
        else {
            email = request.query.email
            validationCode = request.query.validation_code
        }

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        const codeRegexResult = await emailCodeRegexValidation(validationCode)
        if (emailRegexResult == false || codeRegexResult == false) {
            return response.status(400).json('Invalid email or validation code')
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

        // * Read saved validation code in database
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        // * Check saved validation code to given validation code
        if (user.email_validation_code == validationCode) {
            // * Activate email
            const validateEmailResponse = await prisma.user.update({
                where: {
                    email: email,
                },
                data: {
                    validated: true,
                }
            })
            if (validateEmailResponse) {
                return response.status(200).json('Email validated')
            }
            else {
                return response.status(400).json('Email didn\'t validate')
            }
        }
        else {
            return response.status(400).json('Email didn\'t validate')
        }
    }
    catch (error) {
        // console.log(error)
        // return response.status(400).json('Email didn\'t validate')
        return false
    }
}

module.exports = {
    validateEmailAddress,
}
