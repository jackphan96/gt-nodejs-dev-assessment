const db = require('../../models/db.js');
const relationshipTable = require('../../database/relationshipTable.js');
const mysql = require("mysql2");
const { it } = require('@jest/globals');
const BaseError = require('../../exceptions/baseError.js');
const httpStatusCodes = require('../../exceptions/httpStatusCodes.js')

// Mock the entire mysql2
jest.mock('mysql2', () => ({
  createConnection: () => ({ 
    connect: () => undefined,
    query: jest.fn()
  })
}));

describe('relationshipTable', () => {
    
    describe('registerStudentTeacherRelationship', () => {
      afterEach(() => {
        // Reset the mock and clear mock calls after each test
        jest.clearAllMocks();
      });
    
      it('should resolve when the relationship is registered successfully', async () => {
        // Arrange
        const teacherEmail = 'teacher@example.com';
        const studentEmail = 'student@example.com';
    
        // Mock the database query to simulate a successful query result
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          // Assert that the query and parameters are correct
          expect(queryParams).toEqual([teacherEmail, studentEmail]);
          // Simulate a successful query result
          callback(null);
        });
    
        // Act and Assert
        await expect(relationshipTable.registerStudentTeacherRelationship(teacherEmail, studentEmail)).resolves.toBeUndefined();
      });
    
      it('should reject with HTTP 500 when a database query error occurs', async () => {
        const teacherEmail = 'teacher@example.com';
        const studentEmail = 'student@example.com';
    
        // Simulate a database query error
        const mockError = new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER);
    
        // Mock the database query to simulate an error response
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          callback(mockError, null);
        });
    
        // Act and Assert
        try {
          await relationshipTable.registerStudentTeacherRelationship(teacherEmail, studentEmail);
        } catch (error) {
          expect(error).toBeInstanceOf(BaseError);
          expect(error.statusCode).toBe(500);
        }
      });
    });

    describe('checkRelationshipExists', () => {
        afterEach(() => {
          // Reset the mock and clear mock calls after each test
          jest.clearAllMocks();
        });
      
        it('should resolve with results when relationships exist', async () => {
          const teacherEmail = 'teacher@example.com';
          const studentList = ['student1@example.com', 'student2@example.com'];
      
          // Mock the database query to simulate a successful query result
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            // Assert that the query and parameters are correct
            expect(queryParams).toEqual([teacherEmail, studentList]);
            // Simulate a successful query result
            callback(null, [{ student_email: 'student1@example.com' }, { student_email: 'student2@example.com' }]);
          });
      
          const results = await relationshipTable.checkRelationshipExists(teacherEmail, studentList);
      
          expect(results).toEqual([{ student_email: 'student1@example.com' }, { student_email: 'student2@example.com' }]);
        });
      
        it('should resolve with an empty array when no relationships exist', async () => {
          const teacherEmail = 'teacher@example.com';
          const studentList = ['student1@example.com', 'student2@example.com'];
      
          // Mock the database query to simulate no results
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            // Simulate an empty query result
            callback(null, []);
          });
      
          const results = await relationshipTable.checkRelationshipExists(teacherEmail, studentList);
      
          expect(results).toEqual([]);
        });
      
        it('should reject with HTTP 500 when a database query error occurs', async () => {
          const teacherEmail = 'teacher@example.com';
          const studentList = ['student1@example.com', 'student2@example.com'];
      
          // Simulate a database query error
          const mockError = new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER);
      
          // Mock the database query to simulate an error response
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            callback(mockError, null);
          });
      
          try {
            await relationshipTable.checkRelationshipExists(teacherEmail, studentList);
          } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.statusCode).toBe(500);
          }
        });
    });

    describe('findCommonStudentsRelationship', () => {
        afterEach(() => {
          // Reset the mock and clear mock calls after each test
          jest.clearAllMocks();
        });
      
        it('should resolve with results when common students are found', async () => {
          const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      
          // Mock the database query to simulate a successful query result
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            // Assert that the query and parameters are correct
            expect(queryParams).toEqual([teacherEmails, teacherEmails.length]);
            // Simulate a successful query result
            callback(null, [{ student_email: 'student1@example.com' }, { student_email: 'student2@example.com' }]);
          });
      
          const results = await relationshipTable.findCommonStudentsRelationship(teacherEmails);
      
          expect(results).toEqual([{ student_email: 'student1@example.com' }, { student_email: 'student2@example.com' }]);
        });
      
        it('should resolve with an empty array when no common students are found', async () => {
          const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      
          // Mock the database query to simulate no results
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            // Simulate an empty query result
            callback(null, []);
          });
      
          const results = await relationshipTable.findCommonStudentsRelationship(teacherEmails);
      
          expect(results).toEqual([]);
        });
      
        it('should reject with HTTP 500 when a database query error occurs', async () => {
          const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      
          // Simulate a database query error
          const mockError = new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER);
      
          // Mock the database query to simulate an error response
          db.query.mockImplementationOnce((query, queryParams, callback) => {
            callback(mockError, null);
          });
      
          try {
            await relationshipTable.findCommonStudentsRelationship(teacherEmails);
          } catch (error) {
            expect(error).toBeInstanceOf(BaseError);
            expect(error.statusCode).toBe(500);
          }
        });
      });
    
})