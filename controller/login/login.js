const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { emailRegexValidation, strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function login(request, response) {
    try {
        const { email, password } = request.body

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        const passwordRegexResult = await strongPasswordRegexValidation(password)
        if (emailRegexResult == false || passwordRegexResult == false) {
            return response.status(400).json('Wrong email or password')
        }

        // * Check if user exist in our database
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })
        if (!user) {
            return response.status(409).json('User Not Founded. Check your email or register')
        }

        // * Check if user registered using Google
        if (user.google_sub) {
            return response.status(200).json('User registered using Google service. Please login the same way')
        }

        // * Check user's credentials
        if (await bcrypt.compare(password, user.password)) {
            // * Create token
            delete user.password
            delete user.google_sub
            delete user.email_validation_code
            delete user.reset_password_token
            delete user.google_image_url
            user.token = jwt.sign(
                user,
                process.env.ACCOUNT_TOKEN_KEY,
                {
                    expiresIn: process.env.ACCOUNT_TOKEN_EXPIRE_TIME,
                }
            )

            // * Send user
            response.status(200).json(user)
        }
        else {
            response.status(400).json('Invalid Credentials')
        }
    }
    catch (error) {
        // console.log(error)
        return response.status(400).json('An error accrued, Please try again')
    }
}


module.exports = {
    login,
}
