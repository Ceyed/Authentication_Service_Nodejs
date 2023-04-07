const express = require('express')
const app = express()
app.use(express.json({ limit: '50mb' }))                                                     // TODO: Check if it is needed

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const auth = require('./middleware/auth')
const { findUser, newUser, saveToken, changePassword } = require('./model/database')
const { emailRegexValidation } = require('./utils/regexValidation')
const { sendEmailValidationCode } = require('./model/sendEmailValidationCode')


app.post('/register', async (request, response) => {
    try {
        const { username, email, password } = request.body

        // * Validate user input
        if (!(username && password && email)) {
            return response.status(400).send('All input is required')
        }

        // * Regex validation
        const emailRegexResult = await emailRegexValidation(email)
        if (emailRegexResult == false) {
            return response.status(400).send('Invalid email address')
        }
        //                                                                       TODO: Password Regex Validation: numb3r, special ch@r, UPPER, lower


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
        response.status(400).json(error.message)                                                 // TODO: Should it return the message?
    }
})


app.post('/login', async (request, response) => {
    try {
        const { username, email, password } = request.body

        // * Validate user input
        if ((!username && !email) || !password) {
            return response.status(400).send('username (or email) and password are required')
        }

        //                                                                                              TODO: Password validation


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
        return response.status(400).send('An error accrued, Please try again')
    }
})


app.post('/reset_password', auth, async (request, response) => {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)

        const { old_password, new_password } = request.body

        // * Check if passwords are identical
        if (old_password == new_password) {
            return response.status(400).send('Invalid Credentials')
        }

        // * Check old passwords
        if (await bcrypt.compare(old_password, user.password)) {
            // * Encrypt user's new password
            newEncryptedPassword = await bcrypt.hash(new_password, parseInt(process.env.SALT_ROUNDS))
            if (await changePassword(user.id, newEncryptedPassword)) {
                return response.status(200).send('Password changed')
            }
            else {
                return response.status(400).send('Password didn\'t changed')
            }
        }
        else {
            return response.status(400).send('Invalid Credentials')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})


app.post('/forgot_password', auth, async (request, response) => {                                        // TODO: Can it be Get method?
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const sendEmailResponse = await sendEmailValidationCode(request, response, user.email)
        if (!sendEmailResponse) {
            return response.status(400).send('An error accrued during sending email, Please try again')
        }
        else {
            return response.status(200).send('Reset code sent. Please check your email')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})


app.get('/welcome', auth, (request, response) => {
    response.status(200).send('Welcome 🙌')
})


// * This should be the last route else any after it won't work
app.use('*', (req, res) => {
    res.status(404).json({
        success: 'false',
        message: 'Page not found',
        error: {
            statusCode: 404,
            message: 'You reached a route that is not defined on this server',
        },
    })
})


app.listen(process.env.PORT, function () {
    console.log(`Server Is Online::${process.env.PORT}`)
})
