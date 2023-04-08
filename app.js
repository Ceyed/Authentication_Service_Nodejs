const express = require('express')
const app = express()
app.use(express.json({ limit: '50mb' }))                                                     // TODO: Check if it is needed

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const auth = require('./middleware/auth')
const { findUser, newUser, saveToken, changePassword, checkResetCode } = require('./model/database')
const { emailRegexValidation, strongPasswordRegexValidation } = require('./utils/regexValidation')
const { sendEmailValidationCode } = require('./model/sendEmailValidationCode')
const { validateEmailAddress } = require('./model/validateEmailAddress')
const { sendForgotPasswordCode } = require('./model/sendForgotPasswordCode')


app.post('/register', async (request, response) => {
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
        return response.status(400).send('An error accrued, Please try again')
    }
})


app.post('/change_password', auth, async (request, response) => {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)

        const { old_password, new_password } = request.body

        // * Check if passwords are identical
        if (old_password == new_password) {
            return response.status(400).send('Invalid Credentials')
        }

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(new_password)
        if (passwordRegexResult == false) {
            return response.status(400).send('Invalid password')
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


app.post('/forgot_password', auth, async (request, response) => {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const sendEmailResponse = await sendForgotPasswordCode(request, response, user.email)
        if (!sendEmailResponse) {
            return response.status(400).send('An error accrued during sending email, Please try again')
        }
        else {
            return response.status(200).send('Reset code sended. Please check your email')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})
app.post('/check_resetcode', auth, async function (request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const { reset_code } = request.body

        const sendEmailResponse = await checkResetCode(user.email, reset_code)
        if (sendEmailResponse) {
            return response.status(200).send('Reset code matches')
        }
        else {
            return response.status(200).send('Reset code is wrong')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})
app.post('/new_password', auth, async function (request, response) {                                // TODO: Access directly to this request
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const { new_password } = request.body

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(new_password)
        if (passwordRegexResult == false) {
            return response.status(400).send('Invalid password')
        }

        // * Encrypt user's new password
        newEncryptedPassword = await bcrypt.hash(new_password, parseInt(process.env.SALT_ROUNDS))
        if (await changePassword(user.id, newEncryptedPassword, user.email)) {
            return response.status(200).send('Password changed')
        }
        else {
            return response.status(400).send('Password didn\'t changed')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})


app.post('/send_evc', async (request, response) => {
    try {
        const { email } = request.body

        if (await sendEmailValidationCode(request, response, email)) {
            return response.status(200).send('Validation code sended. Check your email')
        }
        else {
            return response.status(400).send('Validation code didn\'t send')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})
app.get('/validate_email', async function (request, response) {
    try {
        const { email, validation_code } = request.query

        if (await validateEmailAddress(email, validation_code)) {
            return response.status(200).send('Email validated')
        }
        else {
            response.status(400).send('Email didn\'t validate')
        }
    }
    catch (error) {
        return response.status(400).send('An error accrued, Please try again')
    }
})
app.post('/validate_email', async function (request, response) {
    try {
        const { email, validationCode } = request.body

        if (await validateEmailAddress(email, validationCode)) {
            return response.status(200).send('Email validated')
        }
        else {
            return response.status(400).send('Email didn\'t validate')
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


app.listen(process.env.SERVER_PORT, function () {
    console.log(`Server Is Online::${process.env.SERVER_PORT}`)
})
