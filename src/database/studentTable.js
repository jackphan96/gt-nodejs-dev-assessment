const db = require("../models/db.js");
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')
const BaseError = require('../exceptions/baseError.js')

// Function to check if a student exists
const checkStudentExists = (studentEmail) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM student WHERE email = ?';
    db.query(query, [studentEmail], (error, results) => {
      if (error) {
        return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
      }
      const count = results[0].count;
      resolve(count > 0);
    });
  });
}

// Function to insert a new student
function insertNewStudent(studentEmail) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO student (email, is_suspended) VALUES (?, ?)';
    db.query(query, [studentEmail, 0], (error, results) => {
      if (error) {
        return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
      }
      resolve(results.email);
    });
  });
}
  
function suspendStudent(studentEmail){
  return new Promise((resolve, reject) => {
    const query = 'UPDATE student SET is_suspended = 1 WHERE email = (?)';
    db.query(query, [studentEmail], (error, results) => {
      if (error) {
        return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
      } else {
        resolve();
      }
    });
  });
}

function retrieveOneStudent(studentEmail){
  return new Promise((resolve, reject) => {
    const query = 'SELECT is_suspended FROM student WHERE email = (?)';
    db.query(query, [studentEmail], (error, results) => {
      if (error) {
        return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
      } else {
        if(results.length === 0){
          resolve(-1);
        }
        resolve(results[0].is_suspended);
      }
    });
  });
}

function getRecipientFromDb(teacher, cleanedStudents){
  return new Promise((resolve, reject) => {
    let query;
    let queryParams = [teacher];

    if (cleanedStudents.length === 0){
      query = `
        SELECT DISTINCT s.email
        FROM student s
        WHERE s.is_suspended = 0
        AND s.email IN (
          SELECT tsr.student_email
          FROM teacher_student_rs tsr
          WHERE tsr.teacher_email = (?)
        )`;
    } else {
      query = `
        SELECT DISTINCT s.email
        FROM student s
        WHERE s.is_suspended = 0
        AND (
          s.email IN (?)
          OR
          s.email IN (
            SELECT tsr.student_email
            FROM teacher_student_rs tsr
            WHERE tsr.teacher_email = (?)
          )
        )
      `;
      
      queryParams.unshift(cleanedStudents);

    }

    // Add cleanedStudents to the query parameters

    db.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
      }else {
        resolve(results);
      }
    })
  });
}


module.exports = {
    checkStudentExists,
    insertNewStudent,
    suspendStudent,
    getRecipientFromDb,
    retrieveOneStudent
};