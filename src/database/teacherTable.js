const db = require("../models/db.js");
const HTTP500Error = require("../exceptions/apiError.js")

const checkTeacherExists = (teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM teacher WHERE email = ?';
        db.query(query, [teacherEmail], (error, results) => {
          if (error) {
            throw HTTP500Error("QUERY ERROR: checkTeacherExists");
        }
          const count = results[0].count;
          resolve(count > 0);
        });
    });
}

module.exports = {
    checkTeacherExists
};