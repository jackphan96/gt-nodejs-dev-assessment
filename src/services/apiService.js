const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js');
const HTTP400Error = require('../exceptions/badRequest.js')


const registerStudent = async (body) => {

    const { teacher, students } = body;

    // Check if the teacher exists in the database

    const teacherExists = await teacherTable.checkTeacherExists(teacher);
    if (!teacherExists) {
        throw new HTTP400Error(`Teacher ${teacher} not found in db`);
    }

    // Check if relationship exist between any student before registering
    const registeredStudentFound = await relationshipTable.checkRelationshipExists(teacher, students);
    if (registeredStudentFound.length > 0) {
        let studentString = registeredStudentFound.map(obj => obj.student_email).join(', ');
        throw new HTTP400Error(`Student already registered: ${studentString}`);
    }

    // Register students
    for (const studentEmail of students) {
        // Check if the student exists
        const studentExists = await studentTable.checkStudentExists(studentEmail);

        if (!studentExists) {
            // If the student doesn't exist, insert them into the "student" table
            const newStudent = await studentTable.insertNewStudent(studentEmail);
            console.log(`Inserted new student: ${newStudent}`);
        }

        // Register the student-teacher relationship
        await relationshipTable.registerStudentTeacherRelationship(teacher, studentEmail);
    }

}

const findCommonStudents = async (teacherEmails) => {
    let results = await relationshipTable.findCommonStudentsRelationship(teacherEmails);
    console.log(results);
    // Extract student emails from the query results
    const commonStudents = results.map((result) => result.student_email);
    return commonStudents;
}

module.exports = {
    registerStudent,
    findCommonStudents
};