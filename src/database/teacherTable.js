const db = require("../models/db.js");
const HTTP500Error = require("../exceptions/apiError.js")

const checkTeacherExists = (teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM teacher WHERE email IN (?)';
        db.query(query, [teacherEmail], (error, results) => {
          if (error) {
            return reject(new HTTP500Error("Query error"))
        }
          const count = results[0].count;
          resolve(count > 0);
        });
    });
}

const checkTeacherExistsAndReturnResult = (teacherEmail) => {
  return new Promise((resolve, reject) => {
      const query = 'SELECT email FROM teacher WHERE email IN (?)';
      db.query(query, [teacherEmail], (error, results) => {
        if (error) {
          return reject(new HTTP500Error("Query error"))
        }
        resolve(results);
      });
  });
}


module.exports = {
    checkTeacherExists,
    checkTeacherExistsAndReturnResult
};