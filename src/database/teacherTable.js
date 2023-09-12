const db = require("../models/db.js");

const findByEmail  = (teacherEmail, studentEmailList) => {
        // Check if teacher exist

        // *** check new student
        // check email format of student in studentEmailList
        // if new student, save into STUDENT table
        // if existing RELATIONSHIP table, throw an error
        // save in RELATIONSHIP table
    try {
        db.query("SELECT *  FROM teachera WHERE email = ?", teacherEmail, (error, teacherResult) => {
            if (error) {
                throw error;
            }

            if (teacherResult.length === 0) {
                // throw {
                //   status: 400,
                //   message: `Teacher email '${teacherEmail}' does not exist`
                // };
                console.log( `Teacher email '${teacherEmail}' does not exist`)
            }

            // Insert teacher-student relationships into the database
            const insertRelationshipQuery = 'INSERT INTO teacher_student_rs (teacher_email, student_email) VALUES (?, ?)';
            for (const studentEmail of studentEmailList) {
                db.query(insertRelationshipQuery, [teacherEmail, studentEmail], (err, results) => {
                    if (err) {
                        throw err;
                    }
                    console.log("results ->");
                    console.log(results);
                });

            }

        });
    } catch (error) {
        throw error
    }
}

const checkTeacherExists = (teacherEmail) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM teacher WHERE email = ?';
        db.query(query, [teacherEmail], (error, results) => {
          if (error) {
            return reject(error);
          }
          const count = results[0].count;
          resolve(count > 0);
        });
    });
}

module.exports = {
    findByEmail,
    checkTeacherExists
};