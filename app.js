const express = require('express')
const app = express()
app.use(express.json({ limit: '50mb' }))                                                               // TODO: Check if it is needed

require('dotenv').config()

const auth = require('./middleware/auth')

const { register } = require('./model/register/register')
const { login } = require('./model/login/login')
const { changeUserPassword } = require('./model/change_password/changeUserPassword')
const { sendForgotPasswordCode } = require('./model/forgot_password/sendForgotPasswordCode')
const { checkResetCode } = require('./model/forgot_password/checkResetCode')
const { setNewPassword } = require('./model/forgot_password/setNewPassword')
const { sendEmailValidationCode } = require('./model/validate_email/sendEmailValidationCode')
const { validateEmailAddress } = require('./model/validate_email/validateEmailAddress')


// ! Register
app.post('/register', async (request, response) => {
    try {
        register(request, response)
    }
    catch {
        return response.status(400).json('An error accrued, Please try again')
    }
})

// ! Login
app.post('/login', async (request, response) => {
    try {
        login(request, response)
    }
    catch {
        return response.status(400).json('An error accrued, Please try again')
    }
})

// ! Change Password
app.post('/change_password', auth, async (request, response) => {
    try {
        changeUserPassword(request, response)
    }
    catch {
        return response.status(400).json('An error accrued, Please try again')
    }
})

// ! Forgot Password
app.post('/forgot_password', auth, async (request, response) => {
    try {
        sendForgotPasswordCode(request, response)
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})
app.post('/check_resetcode', auth, async function (request, response) {
    try {
        checkResetCode(request, response)
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})
app.post('/new_password', auth, async function (request, response) {                                // TODO: Access directly to this request
    try {
        setNewPassword(request, response)
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})

// ! Email Validation
app.post('/send_evc', async (request, response) => {
    try {
        sendEmailValidationCode(request, response)
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})
app.get('/validate_email', async function (request, response) {
    try {
        validateEmailAddress(request, response, 'get')
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})
app.post('/validate_email', async function (request, response) {
    try {
        validateEmailAddress(request, response, 'post')
    }
    catch (error) {
        return response.status(400).json('An error accrued, Please try again')
    }
})

// ! Test middleware
app.get('/welcome', auth, (request, response) => {
    response.status(200).json('Welcome 🙌')
})

// ! 404
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

// ! Run server
app.listen(process.env.SERVER_PORT, function () {
    console.log(`Server Is Online::${process.env.SERVER_PORT}`)
})
