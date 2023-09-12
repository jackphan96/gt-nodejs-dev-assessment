const service = require("../services/registerService.js");


exports.register = async (req, res, next) => {
  
  if (!req.body.teacher|| req.body.teacher.length == 0) {
    res.status(400).send({
      status: "FAILED",
      data: {
        error: "One of the following keys is missing or is empty in request body: 'teacher'"
      }
    });
    return;
  }
  //Handle empty list
  // * Assume API always receive list
  if (!req.body.students || req.body.students.length == 0) {
    res.status(400).send({
      status: "FAILED",
      data: {
        error: "One of the following keys is missing or is empty in request body: 'students'"
      }
    });
    return;
  }

  try{
    // Validate teacher
    // Add students
    // Add relationship
    service.registerStudent(req.body);
    res.status(200).send('Register success!');

  }catch (error) {
    console.error('An error occurred:', error);

    res
      .status(error?.status || 500)
      .send({ status: "FAILED", data: { error: error?.message || error } });
  }

};
