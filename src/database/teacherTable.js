const db = require("../models/db.js");
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')
const BaseError = require('../exceptions/baseError.js')

const checkTeacherExists = (teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM teacher WHERE email IN (?)';
        db.query(query, [teacherEmail], (error, results) => {
          if (error) {
            return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
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
          return reject(new BaseError("Internal Server Error", httpStatusCodes.INTERNAL_SERVER))
        }
        resolve(results);
      });
  });
}


module.exports = {
    checkTeacherExists,
    checkTeacherExistsAndReturnResult
};