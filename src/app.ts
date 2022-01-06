import express from 'express';
import dotenv from 'dotenv';
import router from './routers/Route';
dotenv.config();

const app = express()
var cors = require('cors')
app.use(cors())
const port = 5000
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})