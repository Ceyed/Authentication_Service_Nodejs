require('dotenv').config()

const { findUser, checkResetCode } = require('../database')


async function check_resetcode(request, response) {
    try {
        const user = await findUser(undefined, undefined, request.user.user_id)
        const { reset_code } = request.body

        const sendEmailResponse = await checkResetCode(user.email, reset_code)
        if (sendEmailResponse) {
            return response.status(200).send('Reset code matches')
        }
        else {
            return response.status(200).send('Reset code is wrong')
        }
    }
    catch (error) {
        // return response.status(400).send('An error accrued, Please try again')
        return false
    }
}


module.exports = {
    check_resetcode,
}
