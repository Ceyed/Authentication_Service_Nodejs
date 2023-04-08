const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { findUser, newUser, saveToken } = require('../database')
const { emailRegexValidation, strongPasswordRegexValidation } = require('../../utils/regexValidation')
const { sendEmailValidationCode } = require('../validate_email/sendEmailValidationCode')


async function register(request, response) {
    try {
        const { username, email, password } = request.body

        // * Validate user input
        if (!(username && password && email)) {
            return response.status(400).send('All input is required')
        }

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        const passwordRegexResult = await strongPasswordRegexValidation(password)
        if (emailRegexResult == false || passwordRegexResult == false) {
            return response.status(400).send('Invalid Inputs')
        }

        // * check if user already exist
        const oldUser = await findUser(username, email)
        if (oldUser == 'error') {
            return response.status(400).send('An error accrued, Please try again')
        }
        else if (oldUser) {
            return response.status(409).send('User Already Exist. Please Login')
        }

        // * Encrypt user password
        encryptedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))

        // * Create user in our database
        var user = await newUser([username, email.toLowerCase(), encryptedPassword])
        if (!user) {
            return response.status(400).send('Couldn\'t create new user')
        }

        // * Create token
        const token = jwt.sign(
            { user_id: user.id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: process.env.TOKEN_EXPIRE_TIME,
            }
        )

        // * save user token
        user = await saveToken(user.id, token)

        // * Email validation
        await sendEmailValidationCode(request, response, email)                                   // TODO: Can it be NOT await?

        // * return new user
        response.status(201).json(user)
    }
    catch (error) {
        // console.log(error)
        // return response.status(400).send('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    register,
}
