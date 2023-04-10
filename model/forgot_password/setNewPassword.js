const bcrypt = require('bcryptjs')

require('dotenv').config()

const { findUser, changePassword } = require('../database')
const { strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function setNewPassword(request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const { new_password } = request.body

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(new_password)
        if (passwordRegexResult == false) {
            return response.status(400).json('Invalid password')
        }

        // * Encrypt user's new password
        newEncryptedPassword = await bcrypt.hash(new_password, parseInt(process.env.SALT_ROUNDS))
        if (await changePassword(user.id, newEncryptedPassword, user.email)) {
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
