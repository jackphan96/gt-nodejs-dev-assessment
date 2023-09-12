const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js')


const registerStudent = async (body) => {

    const { teacher, students } = body;

    // Check if the teacher exists in the database

    const teacherExists = await teacherTable.checkTeacherExists(teacher);
    if (!teacherExists) {
        // return res.status(400).json({ error: 'Teacher not found' });
        throw new Error(`Teacher ${teacher} not found`);
    }

    console.log(teacher);
    console.log(students);

    // Register students
    for (const studentEmail of students) {
        // Check if the student exists
        const studentExists = await studentTable.checkStudentExists(studentEmail);

        if (!studentExists) {
            // If the student doesn't exist, insert them into the "students" table
            const newStudent = await studentTable.insertNewStudent(studentEmail);
            console.log(`Inserted new student: ${newStudent}`);
        }

        // Register the student-teacher relationship
        await relationshipTable.registerStudentTeacherRelationship(teacher, studentEmail);
    }

}

module.exports = {
    registerStudent
};