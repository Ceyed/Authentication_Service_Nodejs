const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { findUser, newUser, saveToken } = require('../database')
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
        const oldUser = await findUser(email)
        if (oldUser == 'error') {
            return response.status(400).json('An error accrued, Please try again')
        }
        else if (oldUser) {
            return response.status(409).json('User Already Exist. Please Login')
        }

        // * Encrypt user password
        encryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))

        // * Create user in our database
        var user = await newUser([email.toLowerCase(), encryptedPassword])
        if (!user) {
            return response.status(400).json('Couldn\'t create new user')
        }

        // * Create token
        const token = jwt.sign(
            { user_id: user.id, email },
            process.env.ACCOUNT_TOKEN_KEY,
            {
                expiresIn: process.env.ACCOUNT_TOKEN_EXPIRE_TIME,
            }
        )

        // * save user token
        user = await saveToken(user.id, token)

        // * Email validation
        request.silenceResponse = true
        sendEmailValidationCode(request, response)

        // * return new user
        response.status(201).json(user)
    }
    catch (error) {
        // console.log(error)
        // return response.status(400).json('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    register,
}
