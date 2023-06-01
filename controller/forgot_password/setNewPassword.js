const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
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

        var user = await prisma.user.findFirst({
            where: {
                reset_password_token: resetToken,
            }
        })
        if (!user) {
            return response.status(400).json('Invalid reset token')
        }

        // * Encrypt and save user's new password
        const updateResponse = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS)),
                reset_password_token: null
            }
        })
        if (updateResponse) {
            return response.status(200).json('Password changed')
        }
        else {
            return response.status(400).json('Password didn\'t changed')
        }
    }
    catch (error) {
        console.log(error)
        return response.status(400).json('An error accrued, Please try again')
        // return false
    }
}


module.exports = {
    setNewPassword,
}
