const db = require('../../models/db.js');
const teacherTable = require('../../database/teacherTable.js');
const mysql = require("mysql2");
const { describe } = require('@jest/globals');
const BaseError = require('../../exceptions/baseError.js');
const httpStatusCodes = require('../../exceptions/httpStatusCodes.js')

// Mock the entire mysql2
jest.mock('mysql2', () => ({
  createConnection: () => ({ 
    connect: () => undefined,
    query: jest.fn()
  })
}));

describe('teacherTable', () => {
    
    describe('checkTeacherExists', () => {
      afterEach(() => {
        // Reset the mock and clear mock calls after each test
        jest.clearAllMocks();
      });
    
      it('should resolve to true when teacher exists', async () => {
        const teacherEmail = 'existing@example.com';
    
        // Mock the database query to simulate a successful query result
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          // Assert that the parameters are correct
          expect(queryParams).toEqual(['existing@example.com']);
          // Simulate a successful query result
          callback(null, [{ count: 1 }]);
        });
    
        await expect(teacherTable.checkTeacherExists(teacherEmail)).resolves.toBe(true);
      });
    
      it('should resolve to false when teacher does not exist', async () => {
        const teacherEmail = 'nonexistent@example.com';
    
        // Mock the database query to simulate a successful query result
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          // Assert that the parameters are correct
          expect(queryParams).toEqual(['nonexistent@example.com']);
          // Simulate a query result with count 0
          callback(null, [{ count: 0 }]);
        });
    
        await expect(teacherTable.checkTeacherExists(teacherEmail)).resolves.toBe(false);
      });
    
      it('should reject with HTTP 500 when a database query error occurs', async () => {
        const teacherEmail = 'existing@example.com';
    
        // Simulate a database query error
        const mockError = new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER);
    
        // Mock the database query to simulate an error response
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          expect(queryParams).toEqual(['existing@example.com']);

          callback(mockError, null);
        });

        try {
          await teacherTable.checkTeacherExists(teacherEmail);
        } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('Internal Server Error');
        }
      });
    });

    describe('checkTeacherExistsAndReturnResult', () => {
      afterEach(() => {
        // Reset the mock and clear mock calls after each test
        jest.clearAllMocks();
      });


      it('should return teacher emails that exist', async () => {
        const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

        // Mock the db.query method to resolve
        db.query.mockImplementation((query, queryParams, callback) => {
          expect(queryParams).toEqual([teacherEmails]);

          callback(null, [{ email: 'teacher1@example.com' }, { email: 'teacher2@example.com' }]);
        });
    
        // Call the function
        const results = await teacherTable.checkTeacherExistsAndReturnResult(teacherEmails);
    
        // Assertions
        expect(results).toEqual(expect.arrayContaining([{ email: 'teacher1@example.com' }, { email: 'teacher2@example.com' }]));
      });
    
      it('should return an empty array for teacher emails that do not exist', async () => {
        const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

        // Mock the db.query method to resolve with an empty result set
        db.query.mockImplementation((query, queryParams, callback) => {
          expect(queryParams).toEqual([teacherEmails]);

          callback(null, []);
        });
    
        // Call the function
        const results = await teacherTable.checkTeacherExistsAndReturnResult(teacherEmails);
    
        // Assertions
        expect(results).toEqual([]);
      });
    
      it('should throw an error on database query failure', async () => {
        const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

        // Mock the db.query method to reject
        db.query.mockImplementation((query, queryParams, callback) => {
          expect(queryParams).toEqual([teacherEmails]);

          callback(new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER), null);
        });

        try {
          // Call the function
          await teacherTable.checkTeacherExistsAndReturnResult(teacherEmails);
        } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe('Internal Server Error');
        }
      });

    });
})
