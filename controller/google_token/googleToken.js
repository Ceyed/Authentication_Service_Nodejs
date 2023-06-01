const axios = require('axios').default
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const { googleRegister } = require('../register/googleRegister')
const { googleLogin } = require('../login/googleLogin')


async function googleToken(request, response) {
    try {
        const { accessToken } = request.body
        const googleTokenUrl = 'https://www.googleapis.com/oauth2/v3/userinfo?access_token='

        let googleResponse
        try {
            googleResponse = await axios.get(googleTokenUrl + accessToken)
        }
        catch {
            // console.log('Authorization Error')
            return response.status(400).json("Authorization Error")
        }

        const user = await prisma.user.findUnique({
            where: {
                email: googleResponse.data.email,
            }
        })
        if (user) {
            googleLogin(user, response)
            // console.log('Login Request Log')
        }
        else {
            const sub = googleResponse.data.sub
            const name = googleResponse.data.name
            const picture = googleResponse.data.picture
            const email = googleResponse.data.email

            googleRegister(sub, name, picture, email, response)
            // console.log('Register Request Log')
        }
    }
    catch (error) {
        // console.log({ error })
        return response.status(400).json("Bad request")
    }
}


module.exports = {
    googleToken,
}
