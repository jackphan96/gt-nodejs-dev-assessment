const httpMocks = require('node-mocks-http');
const { describe, it, expect } = require('@jest/globals');
const service = require("../services/apiService.js");
const apiController = require('../controllers/apiController.js'); // Adjust the path as needed
const BaseError = require('../exceptions/baseError.js');
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')

jest.mock('../services/apiService.js', () => ({
  registerStudent: jest.fn(),
  findCommonStudents: jest.fn(),
  suspendStudent: jest.fn(),
  retrieveRecipientsForNotifications: jest.fn()
}));

describe('API Controller - /api/register', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });
  
  it('should return HTTP 200 when register students successfully', async () => {
    // Mock request and response objects
    const request = httpMocks.createRequest({
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        teacher: "teacherjoe@gmail.com",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"]
      }
    });
    const response = httpMocks.createResponse();

    // Mock the behavior of the registerStudent function
    service.registerStudent.mockResolvedValue();

    // Call the controller function
    await apiController.register(request, response);

    // Assertions
    expect(service.registerStudent).toHaveBeenCalledWith(request.body);
    expect(response.statusCode).toBe(204);
    expect(response._getData()).toEqual({ message: 'Register successful' });
  });

  it('should throw HTTP 400 when handle missing teacher', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"]
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();
  
    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(service.registerStudent).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should throw HTTP 400 when handle missing student', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "teacherjoe@gmail.com",
        students: []
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();
  
    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(service.registerStudent).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should throw HTTP 400 when handle service errors with a 400 error', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "teacherjoe@gmail.com",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"]
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();

    // Mock the behavior of the registerStudent function to throw an error
    const errorMessage = 'Service error';
    service.registerStudent.mockImplementation(() => {
      throw new BaseError(errorMessage, httpStatusCodes.BAD_REQUEST);
    });

    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(service.registerStudent).toHaveBeenCalledWith(request.body);
    expect(response.statusCode).toBe(400);
    expect(response._getData()).toEqual({ Error: 'Service error' });
  });
  
});

describe('API Controller - /api/commonstudents', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  it('should return HTTP 200 when the request is valid with 1 teacher', async () => {

    const request = httpMocks.createRequest({
      query: {
        teacher: "teacherjoe@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    // Mock the service function to return common students
    const commonStudentsData = ['student1@gmail.com', 'student2@gmail.com'];
    service.findCommonStudents.mockResolvedValue(commonStudentsData);

    await apiController.commonStudents(request, response);

    // Assertions

    expect(response.statusCode).toBe(200);
    expect(service.findCommonStudents).toHaveBeenCalledWith([request.query.teacher]);
    expect(response._getData()).toEqual({ students: commonStudentsData });
  });

  it('should return HTTP 200 when the request is valid with 2 teacher', async () => {
    const request = httpMocks.createRequest({
      query: {
        teacher: ["teacherjoe@gmail.com", "teacherken@gmail.com"]
      }
    });

    const response = httpMocks.createResponse();

    // Mock the service function to return common students
    const commonStudentsData = ['student1@gmail.com', 'student2@gmail.com'];
    service.findCommonStudents.mockResolvedValue(commonStudentsData);

    await apiController.commonStudents(request, response);

    // Assertions

    expect(response.statusCode).toBe(200);
    expect(service.findCommonStudents).toHaveBeenCalledWith(request.query.teacher);
    expect(response._getData()).toEqual({ students: commonStudentsData });
  });

  it('should return HTTP 400 when handle a missing teacher parameter value', async () => {
    const request = httpMocks.createRequest({
      query: {
        teacher: ""
      }
    });

    const response = httpMocks.createResponse();

    await apiController.commonStudents(request, response);

    expect(response.statusCode).toBe(400);
    expect(service.findCommonStudents).not.toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should return HTTP 400 when handle a invalid teacher email', async () => {
    const request = httpMocks.createRequest({
      query: {
        teacher: "test"
      }
    });

    const response = httpMocks.createResponse();

    await apiController.commonStudents(request, response);

    expect(response.statusCode).toBe(400);
    expect(service.findCommonStudents).not.toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: "Invalid teacher value or email format: test" });
  });

  it('should return HTTP 500 when handle service errors', async () => {
    const request = httpMocks.createRequest({
      query: {
        teacher: "teacherjoe@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    // Mock the service function to throw an error
    const errorMessage = 'Service error';
    service.findCommonStudents.mockImplementation(() => {
      throw new BaseError(errorMessage, httpStatusCodes.INTERNAL_SERVER);
    });

    await apiController.commonStudents(request, response);

    expect(response.statusCode).toBe(500);
    expect(service.findCommonStudents).toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: 'Service error' });

  });
});

describe('API Controller - /api/suspend', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  it('should return HTTP 204 when request is valid', async () => {
    const request = httpMocks.createRequest({
      body: {
        student: "studentjoe@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    service.suspendStudent.mockResolvedValue();

    await apiController.suspend(request, response);  

    expect(response.statusCode).toBe(204);
    expect(service.suspendStudent).toHaveBeenCalledWith(request.body.student);
    expect(response._getData()).toEqual({ message: "studentjoe@gmail.com suspended successfully" });
  });

  it('should return HTTP 400 when request is invalid', async () => {
    const request = httpMocks.createRequest({
      body: {
        student: ""
      }
    });

    const response = httpMocks.createResponse();

    await apiController.suspend(request, response);  

    expect(response.statusCode).toBe(400);
    expect(service.suspendStudent).not.toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should return HTTP 500 when handle service error', async () => {
    const request = httpMocks.createRequest({
      body: {
        student: "studentjoe@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    // Mock the service function to throw an error
    const errorMessage = 'Service error';
    service.suspendStudent.mockImplementation(() => {
      throw new BaseError(errorMessage, httpStatusCodes.INTERNAL_SERVER);
    });

    await apiController.suspend(request, response);  

    expect(response.statusCode).toBe(500);
    expect(service.suspendStudent).toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: 'Service error' });
  });
});

describe('API Controller - /api/retrievefornotifications', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  it('should return HTTP 204 when request is valid', async () => {
    const request = httpMocks.createRequest({
      body: {
        teacher:  "teacherken@gmail.com",
        notification: "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    const studentsList = ['studentagnes@gmail.com', 'studentmiche@gmail.com'];
    service.retrieveRecipientsForNotifications.mockResolvedValue(studentsList);

    await apiController.retrieveForNotifications(request, response);  

    expect(response.statusCode).toBe(200);
    expect(service.retrieveRecipientsForNotifications).toHaveBeenCalledWith(request.body);
    expect(response._getData()).toEqual({ recipients: studentsList });
  });

  it('should return HTTP 400 when request is invalid with teacher empty', async () => {
    const request = httpMocks.createRequest({
      body: {
        teacher:  "",
        notification: "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    await apiController.retrieveForNotifications(request, response);  

    expect(response.statusCode).toBe(400);
    expect(service.retrieveRecipientsForNotifications).not.toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should return HTTP 400 when request is invalid with empty key teacher', async () => {
    const request = httpMocks.createRequest({
      body: {
        notification: "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    await apiController.retrieveForNotifications(request, response);  

    expect(response.statusCode).toBe(400);
    expect(service.retrieveRecipientsForNotifications).not.toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: "Missing or Invalid request body" });
  });

  it('should return HTTP 500 when handle service error', async () => {
    const request = httpMocks.createRequest({
      body: {
        teacher:  "teacherken@gmail.com",
        notification: "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
      }
    });

    const response = httpMocks.createResponse();

    // Mock the service function to throw an error
    const errorMessage = 'Service error';
    service.retrieveRecipientsForNotifications.mockImplementation(() => {
      throw new BaseError(errorMessage, httpStatusCodes.INTERNAL_SERVER);
    });

    await apiController.retrieveForNotifications(request, response);  

    expect(response.statusCode).toBe(500);
    expect(service.retrieveRecipientsForNotifications).toHaveBeenCalled();
    expect(response._getData()).toEqual({ Error: 'Service error' });
  });
});
