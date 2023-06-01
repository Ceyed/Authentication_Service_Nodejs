const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { emailRegexValidation, strongPasswordRegexValidation } = require('../../utils/regexValidation')
const { sendEmailValidationCode } = require('../validate_email/sendEmailValidationCode')


async function register(request, response) {
    try {
        const { email, password } = request.body

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        const passwordRegexResult = await strongPasswordRegexValidation(password)
        if (emailRegexResult == false || passwordRegexResult == false) {
            return response.status(400).json('Wrong email or password')
        }

        // * check if user already exist
        const emailUsername = email.split('@')[0].replaceAll('.', '')
        const allEmails = await prisma.user.findMany({
            select: {
                email: true
            }
        })
        for (let dbEmail of allEmails) {
            if (dbEmail.email.split('@')[0].replaceAll('.', '') == emailUsername) {
                return response.status(409).json('User Already Exist. Please Login')
            }
        }

        // * Encrypt user password
        encryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))

        // * Create user in our database
        var user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: encryptedPassword,
                email_validation_code: (Math.floor(Math.random() * 100000000) + 100000000).toString().substring(1)
            }
        })
        if (!user) {
            return response.status(400).json('Couldn\'t create new user')
        }

        delete user.password

        // * Create token
        user.token = jwt.sign(
            user,
            process.env.ACCOUNT_TOKEN_KEY,
            {
                expiresIn: process.env.ACCOUNT_TOKEN_EXPIRE_TIME
            }
        )

        sendEmailValidationCode(request, response)

        response.status(201).json(user)
    }
    catch (error) {
        response.status(400).json("Bad request")
        console.log({ error })
        return false
    }
}


module.exports = {
    register,
}
