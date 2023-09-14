const db = require("../models/db.js");
const HTTP500Error = require("../exceptions/apiError.js")

function registerStudentTeacherRelationship(teacherEmail, studentEmail) {
  return new Promise((resolve, reject) => {
      const query = 'INSERT INTO teacher_student_rs (teacher_email, student_email) VALUES (?, ?)';
      db.query(query, [teacherEmail, studentEmail], (error, results) => {
        if (error) {
          throw HTTP500Error("QUERY ERROR: registerStudentTeacherRelationship");
        }
        resolve(results);
      });
  });
}

function checkRelationshipExists(teacherEmail, studentList) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT student_email
      FROM teacher_student_rs
      WHERE teacher_email = (?) AND student_email IN (?)
    `;
    db.query(query, [teacherEmail, studentList], (error, results) => {
      if (error) {
        throw HTTP500Error("QUERY ERROR: checkRelationshipExists");
      }
      resolve(results); 
    });
  });
}

function findCommonStudentsRelationship (teacherEmails) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT student_email
      FROM teacher_student_rs
      WHERE teacher_email IN (?)
      GROUP BY student_email
      HAVING COUNT(DISTINCT teacher_email) = ?
    `;

    db.query(query, [teacherEmails, teacherEmails.length], (error, results) => {
      if (error) {
        throw HTTP500Error("QUERY ERROR: findCommonStudentsRelationship");
      }
      resolve(results); 
    });
  });
}

module.exports = {
    registerStudentTeacherRelationship,
    checkRelationshipExists,
    findCommonStudentsRelationship
};