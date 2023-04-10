const express = require('express')
const app = express()
app.use(express.json({ limit: '50mb' }))                                                                // TODO: Check if it is needed

require('dotenv').config()

require('./routes')(app)

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is Online:${process.env.SERVER_PORT}`);
})
