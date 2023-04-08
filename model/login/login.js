const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const { findUser, saveToken } = require('../database')
const { strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function login(request, response) {
    try {
        const { username, email, password } = request.body

        // * Validate user input
        if ((!username && !email) || !password) {
            return response.status(400).send('username (or email) and password are required')
        }

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(password)
        if (passwordRegexResult == false) {
            return response.status(400).send('Invalid password')
        }


        // * Validate if user exist in our database
        var user = await findUser(username, email)
        if (user == 'error') {
            return response.status(400).send('An error accrued, Please try again')
        }
        else if (!user) {
            return response.status(409).send('User Not Founded. Please Register')
        }

        // * Check user's credentials
        if (user && (await bcrypt.compare(password, user.password))) {
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

            // * user
            response.status(200).json(user)
        }
        else {
            response.status(400).send('Invalid Credentials')
        }
    }
    catch (error) {
        // return response.status(400).send('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    login,
}
