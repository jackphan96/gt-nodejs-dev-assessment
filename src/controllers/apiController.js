const service = require("../services/registerService.js");


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
    res.status(200).send('Register success!');

  }catch (error) {
    console.error('An error occurred:', error.statusCode);

    res.status(error?.statusCode || 500)
      .send({ message: error?.name || error });
  }

};

// API 2 - As a teacher, I want to retrieve a list of students common to a given list of teachers (i.e. retrieve students who are registered to ALL of the given teachers).

// API 3- As a teacher, I want to suspend a specified student.

// API 4 - As a teacher, I want to retrieve a list of students who can receive a given notification.
