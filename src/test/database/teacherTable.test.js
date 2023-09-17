const db = require('../../models/db.js');
const HTTP500Error = require('../../exceptions/apiError.js');
const teacherTable = require('../../database/teacherTable.js');
const mysql = require("mysql2");
const { describe } = require('@jest/globals');

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
          // Assert that the query and parameters are correct
          expect(queryParams).toEqual([teacherEmail]);
          // Simulate a successful query result
          callback(null, [{ count: 1 }]);
        });
    
        await expect(teacherTable.checkTeacherExists(teacherEmail)).resolves.toBe(true);
      });
    
      it('should resolve to false when teacher does not exist', async () => {
        const teacherEmail = 'nonexistent@example.com';
    
        // Mock the database query to simulate a successful query result
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          // Assert that the query and parameters are correct
          expect(query).toContain('SELECT COUNT(*) as count FROM teacher WHERE email = ?');
          expect(queryParams).toEqual([teacherEmail]);
          // Simulate a query result with count 0
          callback(null, [{ count: 0 }]);
        });
    
        await expect(teacherTable.checkTeacherExists(teacherEmail)).resolves.toBe(false);
      });
    
      it('should reject with HTTP500Error when a database query error occurs', async () => {
        const teacherEmail = 'existing@example.com';
    
        // Simulate a database query error
        const mockError = new HTTP500Error('Database error');
    
        // Mock the database query to simulate an error response
        db.query.mockImplementationOnce((query, queryParams, callback) => {
          callback(mockError, null);
        });
    
        await expect(teacherTable.checkTeacherExists(teacherEmail)).rejects.toThrow(HTTP500Error);
      });
    });
    
})
