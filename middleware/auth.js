const jwt = require("jsonwebtoken")

require("dotenv").config()

const verifyToken = (request, response, next) => {
    const token = request.headers[process.env.TOKEN_IN_HEADER]

    if (!token) {
        return response.status(403).json("A token is required for authentication")
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCOUNT_TOKEN_KEY)
        request.user = decoded
    }
    catch (error) {
        // console.log(error);
        return response.status(401).json("Invalid Token")
    }
    return next()
}

module.exports = verifyToken
