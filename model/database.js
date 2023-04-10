const { Client } = require('pg')
require('dotenv').config()


// * Define create table query
// TODO: "modified_at" does not updating data in db
const createValidateTableQuery = `
    CREATE TABLE IF NOT EXISTS ${process.env.VALIDATE_TABLE_NAME} (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(50) NOT NULL,
        "code" VARCHAR(8) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "modified_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`

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


async function runQuery(queryCommand, insertData = null) {
    // * Create client object
    const client = new Client({
        host: "localhost",
        user: process.env.DB_USERNAME,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    })

    try {
        // * Create connection to database
        await client.connect()

        // * Create table every time just incase
        await client.query(createUsersTableQuery)
        await client.query(createValidateTableQuery)
        await client.query(createForgotPasswordTableQuery)

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
        return "error"                                                                          // TODO: Check later
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


async function changePassword(userId, password, email = null) {
    try {
        const queryRespond = await runQuery(`UPDATE ${process.env.USERS_TABLE_NAME} SET password = '${password}' WHERE id = ${userId}`)
        if (!queryRespond) {
            return false
        }
        else {
            await runQuery(`DELETE FROM ${process.env.FORGOT_PASSWORD_TABLE_NAME} WHERE email = '${email}' AND EXISTS(SELECT * FROM ${process.env.FORGOT_PASSWORD_TABLE_NAME} WHERE email = '${email}')`)
            return true
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}


async function saveEmailCodeToDB(email) {
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


async function saveForgotPasswordCodeToDB(email) {
    try {
        // * Check if email already exists
        const randomNumber = (Math.floor(Math.random() * 100000000) + 100000000).toString().substring(1)
        const existenceResponse = await runQuery(`SELECT COUNT(*) FROM ${process.env.FORGOT_PASSWORD_TABLE_NAME} WHERE email = '${email}'`)
        if (existenceResponse.rows[0].count == 0) {
            // * Not founded | Insert new row in database
            const insertToDBResponse = await runQuery(`INSERT INTO ${process.env.FORGOT_PASSWORD_TABLE_NAME} ("email", "code") VALUES ('${email}', '${randomNumber}')`)
            if (!insertToDBResponse) {
                return false
            }
        }
        else {
            // * Founded | Update row
            const updateRowDBQueryResponse = await runQuery(`UPDATE ${process.env.FORGOT_PASSWORD_TABLE_NAME} SET code = '${randomNumber}' WHERE email = '${email}'`)
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


async function checkResetCodeInDB(email, reset_code) {
    try {
        const savedResetCode = await runQuery(`SELECT code FROM ${process.env.FORGOT_PASSWORD_TABLE_NAME} WHERE email = '${email}'`)
        if (savedResetCode.rowCount == 0) {
            return false
        }
        else {
            return savedResetCode.rows[0].code == reset_code
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}


async function giveMeValidationCode(userEmail) {
    try {
        // * Read saved code from database and return it
        const validationCodeResponse = await runQuery(`SELECT code FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}'`)
        if (validationCodeResponse.rowCount == 0) {
            // * Not found email
            return false
        }
        else {
            // * Email founded
            return validationCodeResponse.rows[0].code
        }
    }
    catch (error) {
        // console.log(error);
        return false
    }
}


async function validateEmail(userEmail) {
    try {
        const validateEmailResponse = await runQuery(`UPDATE ${process.env.USERS_TABLE_NAME} SET validated = '1' WHERE email = '${userEmail}'`)
        if (!validateEmailResponse) {
            return false
        }
        else {
            await runQuery(`DELETE FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}' AND EXISTS(SELECT * FROM ${process.env.VALIDATE_TABLE_NAME} WHERE email = '${userEmail}')`)
            return true
        }
    }
    catch (error) {
        console.log(error);
        return false
    }

}


async function emailAlreadyValidated(userEmail) {
    try {
        // * Check if email exists
        const existenceResponse = await runQuery(`SELECT COUNT(*) FROM ${process.env.USERS_TABLE_NAME} WHERE email = '${userEmail}'`)
        if (existenceResponse.rows[0].count == 0) {
            // * Not founded
            return false
        }
        else {
            // * Founded
            const emailIsValidResponse = await runQuery(`SELECT validated FROM ${process.env.USERS_TABLE_NAME} WHERE email = '${userEmail}'`)
            return emailIsValidResponse.rows[0].validated
        }
    }
    catch (error) {
        console.log(error);
        return false
    }
}


module.exports = {
    findUser,
    newUser,
    saveToken,
    changePassword,
    saveEmailCodeToDB,
    saveForgotPasswordCodeToDB,
    checkResetCodeInDB,
    giveMeValidationCode,
    validateEmail,
    emailAlreadyValidated,
}
