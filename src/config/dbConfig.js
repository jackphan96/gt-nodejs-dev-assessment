require('dotenv').config();

module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: process.env.DATABASE_PASSWORD,
    DB: "teacher_student",
    insecureAuth : true
};