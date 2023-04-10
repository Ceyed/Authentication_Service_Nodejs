const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { findUser, saveToken } = require('../database')
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

        // * Validate if user exist in our database
        var user = await findUser(email)
        if (user == 'error') {
            return response.status(400).json('An error accrued, Please try again')
        }
        else if (!user) {
            return response.status(409).json('User Not Founded. Please Register')
        }

        // * Check user's credentials
        if (user && (await bcrypt.compare(password, user.password))) {
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

            // * user
            response.status(200).json(user)
        }
        else {
            response.status(400).json('Invalid Credentials')
        }
    }
    catch (error) {
        console.log(error)
        return response.status(400).json('An error accrued, Please try again')
        // return false
    }
}


module.exports = {
    login,
}
