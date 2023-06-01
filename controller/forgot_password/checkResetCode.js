require('dotenv').config()

const { findUser, checkResetCodeInDB } = require('../database')


async function checkResetCode(request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const { reset_code } = request.body

        const sendEmailResponse = await checkResetCodeInDB(user.email, reset_code)
        if (sendEmailResponse) {
            return response.status(200).json('Reset code matches')
        }
        else {
            return response.status(200).json('Reset code is wrong')
        }
    }
    catch (error) {
        // return response.status(400).json('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    checkResetCode,
}
