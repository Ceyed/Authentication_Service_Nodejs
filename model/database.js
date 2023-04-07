const { Client } = require('pg')
require('dotenv').config()


// * Define create table query
const createValidateTableQuery = `
    CREATE TABLE IF NOT EXISTS ${process.env.VALIDATE_TABLE_NAME} (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(50) NOT NULL,
        "code" VARCHAR(8) NOT NULL,
        "validated" BOOL DEFAULT '0',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "modified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
// TODO: "modified_at" does not updating data in db

const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS ${process.env.USERS_TABLE_NAME} (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(20) NOT NULL,
        "email" VARCHAR(50) NOT NULL,
        "password" VARCHAR(200) NOT NULL,
        "validated" BOOL DEFAULT '0',
        "token" VARCHAR(200) DEFAULT '0',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "modified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`


const createForgotPasswordTableQuery = `
    CREATE TABLE IF NOT EXISTS ${process.env.FORGOT_PASSWORD_TABLE_NAME} (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(50) NOT NULL,
        "code" VARCHAR(8) DEFAULT '0',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "modified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`


async function emailAlreadyValidated(userEmail) {
    try {
        // * Create client object
        const client = new Client({
            host: "localhost",
            user: process.env.DB_USERNAME,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })

        // * Create connection to database
        await client.connect()

        // * Create table every time just incase
        await client.query(createValidateTableQuery)

        // * Check if email exists
        const checkIfEmailExistsQuery = `SELECT COUNT(*) FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}'`
        const existenceResponse = await client.query(checkIfEmailExistsQuery)
        if (existenceResponse.rows[0].count == 0) {
            // * Not founded
            await client.end()
            return false
        }
        else {
            // * Founded
            const emailIsValidQuery = `SELECT validated FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}'`
            const emailIsValidResponse = await client.query(emailIsValidQuery)
            await client.end()
            return emailIsValidResponse.rows[0].validated
        }
    }
    catch (error) {
        // console.error(error.stack)
        // TODO: Change lines bellow later, Please
        try {
            // * Close connection if there is any
            await client.end()
        }
        catch {

        }
        return 0
    }
}


async function giveMeValidationCode(userEmail) {
    try {
        // * Create client object
        const client = new Client({
            host: "localhost",
            user: process.env.DB_USERNAME,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })

        // * Create connection to database
        await client.connect()

        // * Create table every time just incase
        await client.query(createValidateTableQuery)

        // * Read saved code from database and return it
        const getValidationCodeQuery = `SELECT code FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}'`
        const validationCodeResponse = await client.query(getValidationCodeQuery)
        if (validationCodeResponse.rowCount == 0) {
            // * Not found email
            // * Close connection to database and return null
            await client.end()
            return null
        }
        else {
            // * Email founded
            // * Close connection to database and return validation code
            await client.end()
            return validationCodeResponse.rows[0].code
        }
    }
    catch (error) {
        // console.error(error.stack)
        // TODO: Change lines bellow later, Please
        try {
            // * Close connection if there is any
            await client.end()
        }
        catch {

        }
        return null
    }
}


async function validateEmail(userEmail) {
    try {
        // * Create client object
        const client = new Client({
            host: "localhost",
            user: process.env.DB_USERNAME,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })

        // * Create connection to database
        await client.connect()

        // * Create table every time just incase
        await client.query(createValidateTableQuery)

        // * Valid email
        try {
            const getValidationCodeQuery = `UPDATE ${process.env.VALIDATE_TABLE_NAME} SET validated = '1' WHERE email = '${userEmail}'`
            await client.query(getValidationCodeQuery)
            // * Close connection to database and return validation code
            await client.end()
            return true
        }
        catch {
            // * Close connection to database and return validation code
            await client.end()
            return false
        }
    }
    catch (error) {
        // console.error(error.stack)
        // TODO: Change lines bellow later, Please
        try {
            // * Close connection if there is any
            await client.end()
        }
        catch {

        }
        return 0
    }
}


async function runQuery(queryCommand, insertData = null) {
    try {
        // * Create client object
        const client = new Client({
            host: "localhost",
            user: process.env.DB_USERNAME,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        })

        // * Create connection to database
        await client.connect()

        // * Create table every time just incase
        await client.query(createUsersTableQuery)
        await client.query(createValidateTableQuery)

        // * Run query
        var queryCommandResponse = null
        if (insertData) {
            queryCommandResponse = await client.query(queryCommand, insertData)
        }
        else {
            queryCommandResponse = await client.query(queryCommand)
        }
        await client.end()
        return queryCommandResponse
    }
    catch (error) {
        // TODO: Change lines bellow later, Please
        try {
            // * Close connection if there is any
            await client.end()
        }
        catch {

        }
        console.log(error)
        return false
    }
}

async function findUser(username = null, email = null, userId = null) {
    try {
        var queryCommand = `SELECT * FROM ${process.env.USERS_TABLE_NAME} `
        if (username && email) {
            // ! Will use in register form
            queryCommand += `WHERE username = '${username}' OR email = '${email}'`
        }
        else if (username) {
            // ! Will use in login form
            queryCommand += `WHERE username = '${username}'`
        }
        else if (email) {
            // ! Will use in login form
            queryCommand += `WHERE email = '${email}'`
        }
        else {
            // ! Will use in test
            queryCommand += `WHERE id = ${userId}`
        }

        const user = await runQuery(queryCommand)
        if (user.rowCount == 0) {
            return false
        }
        else {
            return user.rows[0]
        }
    }
    catch (error) {
        return "error"
    }
}

async function newUser(newUserData) {
    try {
        const user = await runQuery(`INSERT INTO ${process.env.USERS_TABLE_NAME} (username, email, password) VALUES ($1, $2, $3) RETURNING *`, newUserData)
        if (!user) {
            return false
        }
        else {
            return user.rows[0]
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}

async function saveToken(userId, token) {
    try {
        const queryRespond = await runQuery(`UPDATE ${process.env.USERS_TABLE_NAME} SET token = '${token}' WHERE id = ${userId} RETURNING *`)
        if (!queryRespond) {
            return false
        }
        else {
            return queryRespond.rows[0]
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}

async function changePassword(userId, password) {
    try {
        const queryRespond = await runQuery(`UPDATE ${process.env.USERS_TABLE_NAME} SET password = '${password}' WHERE id = ${userId}`)
        if (!queryRespond) {
            return false
        }
        else {
            return true
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}

async function saveCodeToDB(email) {
    try {
        // * Check if email already exists
        const randomNumber = (Math.floor(Math.random() * 100000000) + 100000000).toString().substring(1)
        const existenceResponse = await runQuery(`SELECT COUNT(*) FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${email}'`)
        if (existenceResponse.rows[0].count == 0) {
            // * Not founded | Insert new row in database
            const insertToDBResponse = await runQuery(`INSERT INTO ${process.env.VALIDATE_TABLE_NAME} ("email", "code") VALUES ('${email}', '${randomNumber}')`)
            if (!insertToDBResponse) {
                return false
            }
        }
        else {
            // * Founded | Update row
            const updateRowDBQueryResponse = await runQuery(`UPDATE ${process.env.VALIDATE_TABLE_NAME} SET code = '${randomNumber}' WHERE email = '${email}'`)
            if (!updateRowDBQueryResponse) {
                return false
            }
        }
        return randomNumber
    }
    catch (error) {
        // console.log(error);
        return false
    }
}


module.exports = {
    saveCodeToDB,
    giveMeValidationCode,
    validateEmail,
    emailAlreadyValidated,
    findUser,
    newUser,
    saveToken,
    changePassword,
}
