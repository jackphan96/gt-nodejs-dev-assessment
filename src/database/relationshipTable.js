const db = require("../models/db.js");

function registerStudentTeacherRelationship(teacherEmail, studentEmail) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO teacher_student_rs (teacher_email, student_email) VALUES (?, ?)';
        db.query(query, [teacherEmail, studentEmail], (error, results) => {
          if (error) {
            return reject(error);
          }
          resolve(results);
        });
    });
}

module.exports = {
    registerStudentTeacherRelationship
};