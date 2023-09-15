const db = require("../models/db.js");
const HTTP500Error = require("../exceptions/apiError.js")

// Function to check if a student exists
const checkStudentExists = (studentEmail) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM student WHERE email = ?';
    db.query(query, [studentEmail], (error, results) => {
      if (error) {
        return reject(error)
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
        return reject(error)
      }
      resolve(results.email);
    });
  });
}
  
function suspendStudent(studentEmail){
  return new Promise((resolve, reject) => {
    console.log(studentEmail);

    const query = 'UPDATE student SET is_suspended = 1 WHERE email = (?)';

    db.query(query, [studentEmail], (error, results) => {
      if (error) {
        return reject(error)
      } else {
        console.log(results);
        resolve();
      }
    });
  });
}


module.exports = {
    checkStudentExists,
    insertNewStudent,
    suspendStudent
};