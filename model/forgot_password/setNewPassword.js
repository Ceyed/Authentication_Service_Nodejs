const bcrypt = require('bcryptjs')

require('dotenv').config()

const { changePassword, getEmailForgotPassword } = require('../database')
const { strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function setNewPassword(request, response) {
    try {
        const { resetToken, newPassword, confirmNewPassword } = request.body

        if (!(resetToken && newPassword && confirmNewPassword) || (newPassword != confirmNewPassword)) {
            return response.status(400).json('Invalid inputs')
        }

        // * Regex validation
        if (await strongPasswordRegexValidation(newPassword) == false) {
            return response.status(400).json('Invalid password')
        }

        emailInToken = JSON.parse(Buffer.from(resetToken.split('.')[1], 'base64').toString()).email
        if (await getEmailForgotPassword(resetToken) != emailInToken) {
            return response.status(400).json('Invalid reset token')
        }

        // * Encrypt user's new password
        newEncryptedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS))
        if (await changePassword(newEncryptedPassword, emailInToken)) {
            return response.status(200).json('Password changed')
        }
        else {
            return response.status(400).json('Password didn\'t changed')
        }
    }
    catch (error) {
        // return response.status(400).json('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    setNewPassword,
}
