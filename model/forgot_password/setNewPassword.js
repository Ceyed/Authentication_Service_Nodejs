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
        // return response.status(400).send('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    setNewPassword,
}
