const bcrypt = require('bcryptjs')

require('dotenv').config()

const { findUser, changePassword } = require('../database')
const { strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function changeUserPassword(request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)

        const { old_password, new_password } = request.body

        // * Check if passwords are identical
        if (old_password == new_password) {
            return response.status(400).json('Invalid Credentials')
        }

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(new_password)
        if (passwordRegexResult == false) {
            return response.status(400).json('Invalid password')
        }

        // * Check old passwords
        if (await bcrypt.compare(old_password, user.password)) {
            // * Encrypt user's new password
            newEncryptedPassword = await bcrypt.hash(new_password, parseInt(process.env.SALT_ROUNDS))
            if (await changePassword(newEncryptedPassword, user.email)) {
                return response.status(200).json('Password changed')
            }
            else {
                return response.status(400).json('Password didn\'t changed')
            }
        }
        else {
            return response.status(400).json('Invalid Credentials')
        }
    }
    catch (error) {
        // return response.status(400).json('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    changeUserPassword,
}
