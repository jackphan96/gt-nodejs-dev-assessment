const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js');
const HTTP400Error = require('../exceptions/badRequest.js')
const HTTP404Error = require('../exceptions/notFound.js')
const HTTP409Error = require('../exceptions/conflictError.js')
const HTTP500Error = require('../exceptions/apiError.js')


const registerStudent = async (body) => {
    try {
        const { teacher, students } = body;

        // Check if the teacher exists in the database
        const teacherExists = await teacherTable.checkTeacherExists(teacher);
        if (!teacherExists) {
            throw new HTTP404Error(`Teacher ${teacher} does not exist`);
        }

        // Check student email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const invalidEmails = students.filter(stu => !emailRegex.test(stu));
        if (invalidEmails.length > 0){
            throw new HTTP400Error(`Invalid student email format: ${invalidEmails}`);
        }
    
        // Check if relationship exist between any student before registering
        const registeredStudentFound = await relationshipTable.checkRelationshipExists(teacher, students);
        if (registeredStudentFound.length > 0) {
            let studentString = registeredStudentFound.map(obj => obj.student_email).join(', ');
            throw new HTTP409Error(`Student already registered: ${studentString}`);
        }

        // Register students
        for (const studentEmail of students) {

            // Check if the student exists
            const studentExists = await studentTable.checkStudentExists(studentEmail);
    
            if (!studentExists) {
                // If the student doesn't exist, insert them into the "student" table
                await studentTable.insertNewStudent(studentEmail);
            }
    
            // Register the student-teacher relationship
            await relationshipTable.registerStudentTeacherRelationship(teacher, studentEmail);
        }
    } catch (error) {
        throw error;
    }

}

const findCommonStudents = async (teacherEmails) => {
    try {   
        let results = await relationshipTable.findCommonStudentsRelationship(teacherEmails);
        // Extract student emails from the query results
        const commonStudents = results.map((result) => result.student_email);
        return commonStudents;
    } catch (error) {
        throw error;
    }

}

const suspendStudent = async (studentEmail) => {
    try {
        await studentTable.suspendStudent(studentEmail);
    } catch (error) {
        throw error;
    }
}

const retrieveRecipientsForNotifications = async (body) => {
    try {
        const { teacher, notification } = body;

        // Check if the teacher exists in the database
        const teacherExists = await teacherTable.checkTeacherExists(teacher);
        if (!teacherExists) {
            throw new HTTP404Error(`Teacher ${teacher} does not exist`);
        }

        //Retrieve mentioned student
        const mentionRegex = /@[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
        const mentionedStudents = notification.match(mentionRegex);

        //clean student list - remove '@'
        let cleanedStudents;
        if (mentionedStudents) {
            cleanedStudents = mentionedStudents.map((student) => student.replace('@', ''));
        }else{
            cleanedStudents = []
        }

        //Get receipients for notification
        const studentsList = await studentTable.getRecipientFromDb(teacher, cleanedStudents);
        const commonStudents = studentsList.map((result) => result.email);
        return commonStudents

    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerStudent,
    findCommonStudents,
    suspendStudent,
    retrieveRecipientsForNotifications
};