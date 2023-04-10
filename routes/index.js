const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth')
const { register } = require('../model/register/register')
const { login } = require('../model/login/login')
const { changeUserPassword } = require('../model/change_password/changeUserPassword')
const { sendForgotPasswordCode } = require('../model/forgot_password/sendForgotPasswordCode')
const { setNewPassword } = require('../model/forgot_password/setNewPassword')
const { sendEmailValidationCode } = require('../model/validate_email/sendEmailValidationCode')
const { validateEmailAddress } = require('../model/validate_email/validateEmailAddress')


router.post('/register', register)

router.post('/login', login)

router.post('/change_password', auth, changeUserPassword)

router.post('/forgot_password', sendForgotPasswordCode)
router.post('/new_password', setNewPassword)

router.post('/send_evc', auth, sendEmailValidationCode)                     // TODO: \/
// response.status(200).json(sendEmailValidationCode(request, response))
router.get('/validate_email', validateEmailAddress)
router.post('/validate_email', validateEmailAddress)

router.use('*', (req, response) => {
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
