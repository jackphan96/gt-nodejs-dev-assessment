const service = require("../services/apiService.js");
const HTTP400Error = require('../exceptions/badRequest.js')

//API 1
exports.register = async (req, res, next) => {
  try {
    // Handle empty list
    if (!req.body.teacher || req.body.teacher.length == 0) {
      console.log('Missing teacher key');
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'");
    }
    // Handle empty list
    // Assumptions: API always receive student list
    if (!req.body.students || req.body.students.length == 0) {
      console.log('Missing students key');
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'students'");
    }
    // Call service
    console.log('Before calling service.registerStudent');
    await service.registerStudent(req.body);
    console.log('After calling service.registerStudent');

    res.status(204).send({ message: "Register successful" });
  } catch (error) {
    console.error('Error caught:', error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// API 2
exports.commonStudents = async (req, res, next) => {
  try {
    // Assign single value into list
    const teacherEmails = Array.isArray(req.query.teacher)
    ? req.query.teacher
    : [req.query.teacher];

    // Ensure teacherEmails is not empty
    if (!teacherEmails || teacherEmails.length === 0) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'")

    }

    // Decode query parameters and replace %40 with @
    const decodedTeacherEmails = teacherEmails.map((email) =>
      decodeURIComponent(email).replace(/%40/g, '@')
    );

    // Call service
    let commonStudents = await service.findCommonStudents(decodedTeacherEmails);

    res.status(200).send({ students: commonStudents });
    
  } catch (error) {
    next(error);
  }
}

// API 3
exports.suspend = async (req, res, next) => {
  try {
    // check empty
    if (!req.body.student) {
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'student'")
    }

    let studentEmail = req.body.student;
    await service.suspendStudent(studentEmail);

    res.status(204).send({message: `${studentEmail} suspended successfully`});

  } catch (error) {
    next(error);
  }
}

// API 4
exports.retrieveForNotifications = async (req, res, next) => {
  try {
    if (!req.body.teacher){
      throw new HTTP400Error("One of the following keys is missing or is empty in request body: 'teacher'")
    }

    const studentsList = await service.retrieveRecipientsForNotifications(req.body);

    res.status(200).send({receipients: studentsList});
  } catch (error) {
    next(error);
  }
}