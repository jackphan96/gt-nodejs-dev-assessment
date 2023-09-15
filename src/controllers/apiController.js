const service = require("../services/apiService.js");


exports.register = async (req, res, next) => {
  try{
    // Handle empty list
    if (!req.body.teacher|| req.body.teacher.length == 0) {
      res.status(400).send({
        status: "FAILED",
        data: {
          error: "One of the following keys is missing or is empty in request body: 'teacher'"
        }
      });
      return;
    }
    // Handle empty list
    // Assumptions: API always receive student list
    if (!req.body.students || req.body.students.length == 0) {
      res.status(400).send({
        status: "FAILED",
        data: {
          error: "One of the following keys is missing or is empty in request body: 'students'"
        }
      });
      return;
    }
  
    // Call service
    await service.registerStudent(req.body);
    res.status(200).send();

  }catch (error) {
    res.status(error?.statusCode || 500)
      .send({ message: error?.name || error });
  }

};

// API 2 - As a teacher, I want to retrieve a list of students common to a given list of teachers (i.e. retrieve students who are registered to ALL of the given teachers).
exports.commonstudents = async (req, res, next) => {
  try {
    // Assign single value into list
    const teacherEmails = Array.isArray(req.query.teacher)
    ? req.query.teacher
    : [req.query.teacher];

    // Ensure teacherEmails is not empty
    if (!teacherEmails || teacherEmails.length === 0) {
      return res.status(400).json({ error: 'No teacher emails provided.' });
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
      .send({ message: error?.name || error });
  }
}

// API 3- As a teacher, I want to suspend a specified student.
exports.suspend = async (req, res, next) => {
  try {
    // check empty
    if (!req.body.student) {
      return res.status(400).json({ error: 'Missing student email in the request body' });
    }

    let studentEmail = req.body.student;
    await service.suspendStudent(studentEmail);

    res.status(200).send();

  } catch (error) {
    res.status(error?.statusCode || 500)
      .send({ message: error?.name || error });
  }
}

// API 4 - As a teacher, I want to retrieve a list of students who can receive a given notification.
exports.retrievefornotifications = async (req, res, next) => {
  try {
    
  } catch (error) {
    res.status(error?.statusCode || 500)
      .send({ message: error?.name || error });
  }
}