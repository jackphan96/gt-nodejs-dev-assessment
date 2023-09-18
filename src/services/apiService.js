const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js');
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')
const BaseError = require('../exceptions/baseError.js')


const registerStudent = async (body) => {
    try {
        const { teacher, students } = body;

        // Check if the teacher exists in the database
        const teacherExists = await teacherTable.checkTeacherExists(teacher);
        if (!teacherExists) {
            throw new BaseError(`${teacher} does not exist`, httpStatusCodes.NOT_FOUND);
        }
    
        // Check if relationship exist between any student before registering
        const registeredStudentFound = await relationshipTable.checkRelationshipExists(teacher, students);
        if (registeredStudentFound.length > 0) {
            let studentString = registeredStudentFound.map(obj => obj.student_email).join(', ');
            throw new BaseError(`Student already registered: ${studentString}`, httpStatusCodes.BAD_REQUEST);
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
        //Get teacher exist in a list
        const teacherExistsObjList = await teacherTable.checkTeacherExistsAndReturnResult(teacherEmails);

        const teacherExistList = teacherExistsObjList.map((result) => result.email);
        const teacherNotExistList = teacherEmails.filter(email => !teacherExistList.includes(email));

        if (teacherNotExistList.length > 0){
            let teacherNotExistString = teacherNotExistList.join(', ');
            throw new BaseError(`Teacher does not exist: ${teacherNotExistString}`, httpStatusCodes.NOT_FOUND);
        }

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

        const isSuspendedStatus = await studentTable.retrieveOneStudent(studentEmail);
        if(isSuspendedStatus == -1){
            throw new BaseError(`Student does not exist ${studentEmail}`, httpStatusCodes.NOT_FOUND);
        } else if (isSuspendedStatus == 1) {
            throw new BaseError(`Student is already suspended ${studentEmail}`, httpStatusCodes.BAD_REQUEST);
        }

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
            throw new BaseError(`Teacher ${teacher} does not exist`, httpStatusCodes.NOT_FOUND);
        }

        //Retrieve mentioned student
        const mentionRegex = /@[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
        const mentionedStudents = notification.match(mentionRegex);

        //Clean student list - remove '@'
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