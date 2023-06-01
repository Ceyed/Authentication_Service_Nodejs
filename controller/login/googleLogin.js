const jwt = require('jsonwebtoken')

require('dotenv').config()


async function googleLogin(user, response) {
    try {
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
    catch (error) {
        // console.log(error)
        return response.status(400).json('An error accrued, Please try again')
    }
}


module.exports = {
    googleLogin,
}
