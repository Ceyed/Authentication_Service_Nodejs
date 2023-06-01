const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken')

require('dotenv').config()


async function googleRegister(sub, name, picture, email, response) {
    try {
        // TODO: Do we need lines bellow in this function?
        // // * check if user already exist
        // const emailUsername = email.split('@')[0].replaceAll('.', '')
        // const allEmails = await prisma.user.findMany({
        //     select: {
        //         email: true
        //     }
        // })
        // for (let dbEmail of allEmails) {
        //     if (dbEmail.email.split('@')[0].replaceAll('.', '') == emailUsername) {
        //         return response.status(409).json('User Already Exist. Please Login')
        //     }
        // }

        // * Create user in our database
        var user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                google_sub: sub,
                google_full_name: name,
                google_image_url: picture,
                email_validation_code: (Math.floor(Math.random() * 100000000) + 100000000).toString().substring(1)              // TODO
            }
        })
        if (!user) {
            return response.status(400).json('Couldn\'t create new user')
        }

        delete user.password
        delete user.google_sub
        delete user.email_validation_code
        delete user.reset_password_token
        delete user.google_image_url

        // * Create token
        user.token = jwt.sign(
            user,
            process.env.ACCOUNT_TOKEN_KEY,
            {
                expiresIn: process.env.ACCOUNT_TOKEN_EXPIRE_TIME
            }
        )

        return user
    }
    catch (error) {
        // console.log({ error })
        return false
    }
}


module.exports = {
    googleRegister,
}
