const httpMocks = require('node-mocks-http');
const { describe, it, expect } = require('@jest/globals');
const HTTP400Error = require('../exceptions/badRequest');
const service = require("../services/apiService.js");
const apiController = require('../controllers/apiController'); // Adjust the path as needed

const mockRegisterStudent = jest.spyOn(service, 'registerStudent');

jest.mock('../services/apiService.js', () => ({
  registerStudent: jest.fn(),
  findCommonStudents: jest.fn(),
  suspendStudent: jest.fn(),
  retrieveRecipientsForNotifications: jest.fn(),
}));

describe('API Controller - Register', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });
  
  it('should register students successfully', async () => {
    // Mock request and response objects
    const request = httpMocks.createRequest({
      body: {
        teacher: "teacherjoe@gmail.com",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"],
      },
    });
    const response = httpMocks.createResponse();

    // Mock the behavior of the registerStudent function
    service.registerStudent.mockResolvedValue();

    // Call the controller function
    await apiController.register(request, response);

    console.log(response._getData());

    // Assertions
    expect(service.registerStudent).toHaveBeenCalledWith(request.body);
    expect(response.statusCode).toBe(204);
    expect(response._isEndCalled()).toBeTruthy();
    expect(response._getData()).toEqual({ message: 'Register successful' });
  });

  it('should handle missing teacher', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"],
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();
  
    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(next).toHaveBeenCalledWith(expect.any(HTTP400Error)); // Check that next was called with an HTTP400Error
  });

  it('should handle missing student', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "teacherjoe@gmail.com",
        students: [],
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();
  
    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(next).toHaveBeenCalledWith(expect.any(HTTP400Error)); // Check that next was called with an HTTP400Error
  });

  it('should handle error from service', async () => {
    // Mock request and response objects with missing teacher key
    const request = httpMocks.createRequest({
      body: {
        teacher: "teacherjoe@gmail.com",
        students: ["studentjon@gmail.com","studenthon2@gmail.com"],
      },
    });

    const response = httpMocks.createResponse();

    // Mock the next function
    const next = jest.fn();

    // Mock the behavior of the registerStudent function to throw an error
    const errorMessage = 'Some error occurred';
    service.registerStudent.mockImplementation(() => {
      throw new HTTP400Error(errorMessage);
    });

    // Call the controller function
    await apiController.register(request, response, next);
  
    // Assertions
    expect(service.registerStudent).toHaveBeenCalledWith(request.body);
    expect(response.statusCode).toBe(400);
    // expect(response._isEndCalled()).toBeTruthy();
    // expect(response._getData()).toEqual({ error: errorMessage });
    expect(next).toHaveBeenCalledWith(expect.any(HTTP400Error)); // Check that next was called with an HTTP400Error
  });
  
});
