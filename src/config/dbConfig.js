require('dotenv').config();

module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: process.env.DATABASE_PASSWORD,
    DB: process.env.DATABASE_NAME,
};