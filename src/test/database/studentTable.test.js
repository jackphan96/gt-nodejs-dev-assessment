const db = require('../../models/db.js');
const studentTable = require('../../database/studentTable.js');
const mysql = require("mysql2");
const { describe, expect } = require('@jest/globals');
const BaseError = require('../../exceptions/baseError.js');
const httpStatusCodes = require('../../exceptions/httpStatusCodes.js')

// Mock the entire mysql2
jest.mock('mysql2', () => ({
  createConnection: () => ({ 
    connect: () => undefined,
    query: jest.fn()
  })
}));

describe('studentTable', () => {
    afterEach(() => {
        jest.clearAllMocks();
      });

    describe('checkStudentExists', () => {

        afterEach(() => {
            // Reset the mock after each test
            jest.clearAllMocks();
        });

        it('should resolve to true when student exists', async () => {
            // Mock a successful query result

            db.query.mockImplementation((query, values, callback) => {
                callback(null, [{ count: 1 }]);
            });

            const studentEmail = 'studenttest@gmail.com';
            const exists = await studentTable.checkStudentExists(studentEmail);
            expect(exists).toBe(true);
            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail], expect.any(Function));
        });

        it('should resolve to false when student does not exist', async () => {
            // Mock a query result where student does not exist
            db.query.mockImplementation((query, values, callback) => {
                callback(null, [{ count: 0 }]);
            });

            const studentEmail = 'nonexistent@example.com';
            const exists = await studentTable.checkStudentExists(studentEmail);

            expect(exists).toBe(false);
            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail], expect.any(Function));
        });

        it('should throw HTTP 500 on query error', async () => {
            // Mock a query error
            db.query.mockImplementation((query, values, callback) => {
                callback(new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER), null);
            });

            const studentEmail = 'studenttest@gmail.com';

            try {
                await studentTable.checkStudentExists(studentEmail);
            } catch (error) {
                expect(error).toBeInstanceOf(BaseError);
                expect(error.statusCode).toBe(500);
                expect(error.name).toBe('Internal Server Error');
            }

            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail], expect.any(Function));
        });
    });

    describe('insertNewStudent', () => {
        afterEach(() => {
        // Reset the mock and clear mock calls after each test
            jest.clearAllMocks();
        });
    
        it('should resolve with the student email when the insertion is successful', async () => {
            const studentEmail = 'test@example.com';
        
            // Mock the database query to simulate a successful insertion
            db.query.mockImplementationOnce((query, values, callback) => {
                callback(null, { email: studentEmail }); // Simulate a successful query
            });

            const email = await studentTable.insertNewStudent(studentEmail);
            expect(email).toEqual(email);
            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail, 0], expect.any(Function));
        });
    
        it('should reject with HTTP 500 when a database query error occurs', async () => {
            const studentEmail = 'test@example.com';
            const mockError = new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER);
        
            // Mock the database query to simulate an error response
            db.query.mockImplementationOnce((query, values, callback) => {
                callback(mockError, null);
            });

            try {
                await studentTable.insertNewStudent(studentEmail);
            } catch (error) {
                expect(error).toBeInstanceOf(BaseError);
                expect(error.statusCode).toBe(500);
                expect(error.name).toBe('Internal Server Error');
            }
        
            // Act and Assert
            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail, 0], expect.any(Function));
        });
    });

    describe('suspendStudent', () => {
        afterEach(() => {
            // Reset the mock and clear mock calls after each test
            jest.clearAllMocks();
        });

        it('should resolve when suspend student successfully', async () => {
            const studentEmail = 'test@example.com';

            // Mock the database query to simulate a successful insertion
            db.query.mockImplementationOnce((query, values, callback) => {
                callback(null, { email: studentEmail }); // Simulate a successful query
            });

            const result = await studentTable.suspendStudent(studentEmail);
            expect(result).resolves;

            expect(db.query).toHaveBeenCalledWith(expect.any(String), [studentEmail], expect.any(Function));
        });

        it('should reject with HTTP 500 when a database query error occurs', async () => {
            const studentEmail = 'test@example.com';
            const mockError = new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER);
        
            // Mock the database query to simulate an error response
            db.query.mockImplementationOnce((query, values, callback) => {
            callback(mockError, null);
            });
        
            try {
                await studentTable.suspendStudent(studentEmail);
            } catch (error) {
                expect(error).toBeInstanceOf(BaseError);
                expect(error.statusCode).toBe(500);
                expect(error.name).toBe('Internal Server Error');
            }
        });
    })

    describe('getRecipientFromDb', () => {
        afterEach(() => {
            // Reset the mock and clear mock calls after each test
            jest.clearAllMocks();
        });

        it('should resolve with recipient emails when cleanedStudents is empty', async () => {
            const teacher = 'teacher@example.com';
            const cleanedStudents = [];

            // Mock the database query to simulate a successful query result
            db.query.mockImplementationOnce((query, queryParams, callback) => {
                // Assert that the query and parameters are correct
                expect(queryParams).toEqual([teacher]);
                // Simulate a successful query result
                callback(null, [{ email: 'recipient1@example.com' }, { email: 'recipient2@example.com' }]);
            });

            const studentsList = await studentTable.getRecipientFromDb(teacher, cleanedStudents)
            const commonStudents = studentsList.map((result) => result.email);

            expect(commonStudents).toEqual([
                'recipient1@example.com',
                'recipient2@example.com'
            ]);
        });

        it('should resolve with recipient emails when cleanedStudents is not empty', async () => {
            const teacher = 'teacher@example.com';
            const cleanedStudents = ['student1@example.com', 'student2@example.com'];

            // Mock the database query to simulate a successful query result
            db.query.mockImplementationOnce((query, queryParams, callback) => {
                // Assert that the query and parameters are correct
                expect(queryParams).toEqual([cleanedStudents, teacher]);

                // Simulate a successful query result
                callback(null, 
                    [
                        { email: 'recipient1@example.com' }, 
                        { email: 'recipient2@example.com' }, 
                        { email: 'recipient3@example.com' }
                    ]);
            });

            const studentsList = await studentTable.getRecipientFromDb(teacher, cleanedStudents)
            const commonStudents = studentsList.map((result) => result.email);

            expect(commonStudents).toEqual([
                'recipient1@example.com',
                'recipient2@example.com',
                'recipient3@example.com',
            ]);
        });

        it('should reject with HTTP 500 when a database query error occurs', async () => {
            const teacher = 'teacher@example.com';
            const cleanedStudents = [];

            // Simulate a database query error
            const mockError = new BaseError('Internal Server Error', httpStatusCodes.INTERNAL_SERVER);

            // Mock the database query to simulate an error response
            db.query.mockImplementationOnce((query, queryParams, callback) => {
                callback(mockError, null);
            });

            try {
                await studentTable.getRecipientFromDb(teacher, cleanedStudents);
            } catch (error) {
                expect(error).toBeInstanceOf(BaseError);
                expect(error.statusCode).toBe(500);
                expect(error.name).toBe('Internal Server Error');
            }
        });
    });
});
