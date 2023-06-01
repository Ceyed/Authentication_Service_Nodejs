const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

require('dotenv').config()

const { strongPasswordRegexValidation } = require('../../utils/regexValidation')


async function changeUserPassword(request, response) {
    try {
        const user = request.user

        const { oldPassword, newPassword, confirmNewPassword } = request.body

        // * Check if passwords are identical
        if ((oldPassword == newPassword) || (newPassword != confirmNewPassword)) {
            return response.status(400).json('Invalid Credentials')
        }

        // * Regex validation
        const passwordRegexResult = await strongPasswordRegexValidation(newPassword)
        if (passwordRegexResult == false) {
            return response.status(400).json('Invalid password')
        }

        // * Check old passwords
        if (await bcrypt.compare(oldPassword, user.password)) {
            // * Encrypt and save user's new password
            const passwordChangeResponse = await prisma.user.update({
                where: {
                    email: user.email
                },
                data: {
                    password: await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS))
                },
            })
            if (passwordChangeResponse) {
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
        // console.log(error)
        return false
    }
}


module.exports = {
    changeUserPassword,
}
