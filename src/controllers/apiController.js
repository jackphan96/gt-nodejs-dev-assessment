const service = require("../services/apiService.js");
const HTTP400Error = require('../exceptions/badRequest.js')

//API 1
exports.register = async (req, res, next) => {
  try {
    // Handle empty list
    if (!req.body.teacher || req.body.teacher.length == 0) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'");
    }
    // Handle empty list
    // Assumptions: API always receive student list
    if (!req.body.students || req.body.students.length == 0) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'students'");
    }

    // Check teacher email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const invalidTeacherEmails = !emailRegex.test(req.body.teacher);
    if (invalidTeacherEmails){
        throw new HTTP400Error(`Invalid teacher email format: ${teacher}`);
    }

    // Check student email format
    const invalidEmails = req.body.students.filter(stu => !emailRegex.test(stu));
    if (invalidEmails.length > 0){
        throw new HTTP400Error(`Invalid student email format: ${invalidEmails}`);
    }
    
    // Call service
    await service.registerStudent(req.body);

    res.status(204).send({ message: "Register successful" });
  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({message: error?.name || error });
  }
};

// API 2
exports.commonStudents = async (req, res, next) => {
  try {
    // Ensure teacherEmails is not empty
    if (!req.query.teacher || req.query.teacher.length === 0) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'")
    }       

    // Assign single value into list
    const teacherEmails = Array.isArray(req.query.teacher)? req.query.teacher: [req.query.teacher];

    // Check student email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const invalidEmails = teacherEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0){
      throw new HTTP400Error(`Invalid teacher email format: ${invalidEmails}`);
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
    .send({message: error?.name || error });  
  }
}

// API 3
exports.suspend = async (req, res, next) => {
  try {
    // check empty
    if (!req.body.student || req.body.student.length == 0) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'student'")
    }

    // Check email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const invalidEmails = !emailRegex.test(req.body.student);
    if (invalidEmails){
        throw new HTTP400Error(`Invalid student email format: ${req.body.student}`);
    }

    let studentEmail = req.body.student;
    await service.suspendStudent(studentEmail);

    res.status(204).send({message: `${studentEmail} suspended successfully`});

  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({message: error?.name || error });    
  }
}

// API 4
exports.retrieveForNotifications = async (req, res, next) => {
  try {
    //check if empty or missing key
    if (!req.body.teacher || req.body.teacher == 0){
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'")
    }

    if (!req.body.notification){
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'notification'")
    }

    // Check teacher email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const invalidTeacherEmails = !emailRegex.test(req.body.teacher);
    if (invalidTeacherEmails){
        throw new HTTP400Error(`Invalid teacher email format: ${teacher}`);
    }

    const studentsList = await service.retrieveRecipientsForNotifications(req.body);

    res.status(200).send({recipients: studentsList});
  } catch (error) {
    res.status(error?.statusCode || 500)
    .send({message: error?.name || error });
  }
}