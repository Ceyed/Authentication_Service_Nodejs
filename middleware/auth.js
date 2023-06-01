const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwt = require("jsonwebtoken")

require("dotenv").config()

const verifyToken = async (request, response, next) => {
    try {
        const token = request.headers[process.env.TOKEN_IN_HEADER]
        if (!token) {
            return response.status(403).json("A token is required for authentication")
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCOUNT_TOKEN_KEY)
            request.user = await prisma.user.findUnique({ where: { id: decoded.id, }, })
        }
        catch {
            return response.status(403).json("Invalid Token, Please re-login")
        }
    }
    catch (error) {
        // console.log(error);
        return response.status(401).json("Invalid Token, Please re-login")
    }
    return next()
}

module.exports = verifyToken
