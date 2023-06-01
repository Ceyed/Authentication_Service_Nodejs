const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth')
const { register } = require('../controller/register/register')
const { login } = require('../controller/login/login')
const { changeUserPassword } = require('../controller/change_password/changeUserPassword')
const { sendForgotPasswordCode } = require('../controller/forgot_password/sendForgotPasswordCode')
const { setNewPassword } = require('../controller/forgot_password/setNewPassword')
const { sendEmailValidationCode } = require('../controller/validate_email/sendEmailValidationCode')
const { validateEmailAddress } = require('../controller/validate_email/validateEmailAddress');
const { googleToken } = require('../controller/google_token/googleToken')
const { walletLogin, walletVerify } = require('../controller/wallet_auth/walletAuth')

router.post('/register', register)

router.post('/login', login)

router.post('/change_password', auth, changeUserPassword)

router.post('/forgot_password', sendForgotPasswordCode)
router.post('/new_password', setNewPassword)

// router.post('/send_evc', auth, sendEmailValidationCode)
router.get('/validate_email', validateEmailAddress)
router.post('/validate_email', validateEmailAddress)

router.post('/google_token', googleToken)

router.post('/wallet_login', walletLogin)
router.post('/wallet_verify', walletVerify)

router.use('*', (request, response) => {
    response.status(404).json({
        success: 'false',
        message: 'Page not found',
        error: {
            statusCode: 404,
            message: 'You reached a route that is not defined on this server',
        },
    })
})


module.exports = (app) => {
    app.use('/api/v1', router)
}
