const service = require("../services/apiService.js");
const BaseError = require('../exceptions/baseError.js')
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;


//API 1
exports.register = async (req, res, next) => {
  try {
    //Check Content-Type
    if(req.headers['Content-Type'] === 'application/json'){
      throw new BaseError("Invalid Content-Type", httpStatusCodes.BAD_REQUEST);
    }

    // Handle empty list
    if (!req.body.teacher || req.body.teacher.length === 0) {
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST);
    }
    
    // Handle empty list
    // Assumptions: API always receive student list
    if (!req.body.students || req.body.students.length === 0) {
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST);
    }

    // check if student sent in Array form
    if(!Array.isArray(req.body.students)){
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST);
    }

    // Check teacher email format
    const invalidTeacherEmails = !emailRegex.test(req.body.teacher);
    if (invalidTeacherEmails){
        throw new BaseError(`Invalid email format: ${req.body.teacher}`, httpStatusCodes.BAD_REQUEST);
    }

    // Check student email format
    const invalidStudentEmails = req.body.students.filter(student => !emailRegex.test(student));
    if (invalidStudentEmails.length > 0){
        throw new BaseError(`Invalid email format: ${invalidStudentEmails}`, httpStatusCodes.BAD_REQUEST);
    }
    
    // Call service
    await service.registerStudent(req.body);

    res.status(204).send({ message: "Register successful" });
  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({Error: error?.name || error });
  }
};

// API 2
exports.commonStudents = async (req, res, next) => {
  try {

    // Check if the key is not "teacher"
    const otherKeyExist = Object.keys(req.query).some((key) => key !== 'teacher');
    if (otherKeyExist) {
      throw new BaseError('Invalid parameter key(s) found', httpStatusCodes.BAD_REQUEST);
    }

    // Ensure teacherEmails is not empty
    if (!req.query.teacher || req.query.teacher.length === 0) {
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST)
    }

    // Assign single value into list
    const teacherEmails = Array.isArray(req.query.teacher)? req.query.teacher: [req.query.teacher];

    // Check student email format
    const invalidEmails = teacherEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0){
      throw new BaseError(`Invalid teacher value or email format: ${invalidEmails}`, httpStatusCodes.BAD_REQUEST);
    }

    // Decode query parameters and replace %40 with @
    const decodedTeacherEmails = teacherEmails.map((email) =>
      decodeURIComponent(email).replace(/%40/g, '@')
    );

    // Call service
    let commonStudents = await service.findCommonStudents(decodedTeacherEmails);

    res.status(200).send({ students: commonStudents });
    
  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({Error: error?.name || error });  
  }
}

// API 3
exports.suspend = async (req, res, next) => {
  try {
    //Check Content-Type
    if(req.headers['Content-Type'] === 'application/json'){
      throw new BaseError("Content-Type must be application/json", httpStatusCodes.BAD_REQUEST);
    }

    // check empty
    if (!req.body.student || req.body.student.length === 0) {
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST);
    }

    // Check email format
    const invalidEmails = !emailRegex.test(req.body.student);
    if (invalidEmails){
        throw new BaseError(`Invalid email format: ${req.body.student}`, httpStatusCodes.BAD_REQUEST);
    }

    let studentEmail = req.body.student;
    await service.suspendStudent(studentEmail);

    res.status(204).send({message: `${studentEmail} suspended successfully`});

  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({Error: error?.name || error });    
  }
}

// API 4
exports.retrieveForNotifications = async (req, res, next) => {
  try {
    //Check Content-Type
    if(req.headers['Content-Type'] === 'application/json'){
      throw new BaseError("Content-Type must be application/json", httpStatusCodes.BAD_REQUEST);
    }
    
    //check if empty or missing key
    if (!req.body.teacher || req.body.teacher === 0){
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST)
    }

    //check if notification key is missing
    if (!req.body.notification){
      throw new BaseError("Missing or Invalid request body", httpStatusCodes.BAD_REQUEST)
    }

    // Check teacher email format
    const invalidTeacherEmails = !emailRegex.test(req.body.teacher);
    if (invalidTeacherEmails){
        throw new BaseError(`Invalid teacher email format: ${req.body.teacher}`, httpStatusCodes.BAD_REQUEST);
    }

    const studentsList = await service.retrieveRecipientsForNotifications(req.body);

    res.status(200).send({recipients: studentsList});
  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({Error: error?.name || error });
  }
}