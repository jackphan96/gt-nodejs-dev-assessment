const service = require('../services/apiService.js'); // Import your service module
const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js');
const BaseError = require('../exceptions/baseError.js');
const httpStatusCodes = require('../exceptions/httpStatusCodes.js')


jest.mock('../database/teacherTable.js', () => ({
    checkTeacherExists: jest.fn(),
    checkTeacherExistsAndReturnResult: jest.fn()
}));

jest.mock('../database/studentTable.js', () => ({
    checkStudentExists: jest.fn(),
    insertNewStudent: jest.fn(),
    suspendStudent: jest.fn(),
    getRecipientFromDb: jest.fn(),
    retrieveOneStudent: jest.fn()
}));

jest.mock('../database/relationshipTable.js', () => ({
    registerStudentTeacherRelationship: jest.fn(),
    checkRelationshipExists: jest.fn(),
    findCommonStudentsRelationship: jest.fn()
}));

describe('Service Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service-registerStudent', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should register students successfully', async () => {
      // Mock database functions
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      relationshipTable.checkRelationshipExists.mockResolvedValue([]);
      studentTable.checkStudentExists.mockResolvedValue(true);
      relationshipTable.registerStudentTeacherRelationship.mockResolvedValue();

      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };

      await service.registerStudent(body);

      expect(teacherTable.checkTeacherExists).toHaveBeenCalledWith('teacher@example.com');
      expect(studentTable.checkStudentExists).toHaveBeenCalledWith('student1@example.com');
      expect(studentTable.checkStudentExists).toHaveBeenCalledWith('student2@example.com');
      expect(relationshipTable.checkRelationshipExists).toHaveBeenCalledWith('teacher@example.com', ['student1@example.com', 'student2@example.com']);
      expect(studentTable.insertNewStudent).not.toHaveBeenCalledWith('student1@example.com');
      expect(studentTable.insertNewStudent).not.toHaveBeenCalledWith('student2@example.com'); 
      expect(relationshipTable.registerStudentTeacherRelationship).toHaveBeenCalledWith('teacher@example.com', 'student1@example.com');
      expect(relationshipTable.registerStudentTeacherRelationship).toHaveBeenCalledWith('teacher@example.com', 'student2@example.com');
    });

    it('should throw HTTP 404 when teacher not found ', async () => {
      // Mock database function and simulate teacher not found
      teacherTable.checkTeacherExists.mockResolvedValue(false);
  
      // Create a mock request body
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com']
      };

      try {
        await service.registerStudent(body)
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw HTTP 400 when student already registered', async () => {
      // Mock database functions and simulate student already registered
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      studentTable.checkStudentExists.mockResolvedValue(true);
      relationshipTable.checkRelationshipExists.mockResolvedValue([{ student_email: 'student1@example.com' }]);
  
      // Create a mock request body
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com']
      };
  
      try {
        await service.registerStudent(body)
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw HTTP 500 when error thrown from database', async () => {
      // Mock database functions
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      relationshipTable.checkRelationshipExists.mockResolvedValue([]);
      studentTable.checkStudentExists.mockResolvedValue(true);
      
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com']
      };

      const errorMessage = 'Database error';

      relationshipTable.registerStudentTeacherRelationship.mockImplementation(() => {
        throw new BaseError(errorMessage, httpStatusCodes.INTERNAL_SERVER);
      });

      try {
        await service.registerStudent(body)
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(500);
      }

    });
  });

  describe('Service-findCommonStudents', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return common students successfully', async () => {
      //Mocking methods
      teacherTable.checkTeacherExistsAndReturnResult.mockResolvedValue([
        { email: 'teacher1@example.com' },
        { email: 'teacher2@example.com' }
      ]);

      // Mock the behavior of relationshipTable.findCommonStudentsRelationship
      relationshipTable.findCommonStudentsRelationship.mockResolvedValue([
          { student_email: 'student1@example.com' },
          { student_email: 'student2@example.com' }
      ]);

      // Call the service function
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const commonStudents = await service.findCommonStudents(teacherEmails);

      expect(teacherTable.checkTeacherExistsAndReturnResult).toHaveBeenCalledWith(teacherEmails);
      expect(relationshipTable.findCommonStudentsRelationship).toHaveBeenCalledWith(teacherEmails);

      // Assert the return value
      expect(commonStudents).toEqual(['student1@example.com', 'student2@example.com']);
    });

    it('should throw HTTP 404 when handle teacher does not exist', async () => {
      //Mocking methods
      teacherTable.checkTeacherExistsAndReturnResult.mockResolvedValue([
      ]);

      // Mock the behavior of relationshipTable.findCommonStudentsRelationship
      relationshipTable.findCommonStudentsRelationship.mockResolvedValue([
          { student_email: 'student1@example.com' },
          { student_email: 'student2@example.com' }
      ]);

      // Call the service function
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

      // Assert that the function throws an error
      try {
        await service.findCommonStudents(teacherEmails);
        expect(teacherTable.checkTeacherExistsAndReturnResult).toHaveBeenCalledWith(teacherEmails);
        expect(relationshipTable.findCommonStudentsRelationship).not.toHaveBeenCalled();
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(404);
      }

    });

    it('should throw HTTP 500 when error thrown from database', async () => {
        // Mock methods
        teacherTable.checkTeacherExistsAndReturnResult.mockResolvedValue([
          { email: 'teacher1@example.com' },
          { email: 'teacher2@example.com' }
        ]);

        relationshipTable.findCommonStudentsRelationship.mockRejectedValue(new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER));

        // Call the service function (expecting an error)
        const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

        // Assert that the function throws an error
        try {
          await service.findCommonStudents(teacherEmails);
        } catch (error) {
          expect(error).toBeInstanceOf(BaseError);
          expect(error.statusCode).toBe(500);
        }
    });
  });

  describe('Service-suspendStudent', () => {
    it('should suspend a student successfully', async () => {
      // Mock studentTable method
      studentTable.retrieveOneStudent.mockResolvedValue(0);
      studentTable.suspendStudent.mockResolvedValue();

      // Call the service function
      const studentEmail = 'student@example.com';
      await service.suspendStudent(studentEmail);

      // Assert that studentTable was called with the expected parameter
      expect(studentTable.retrieveOneStudent).toHaveBeenCalledWith(studentEmail);
      expect(studentTable.suspendStudent).toHaveBeenCalledWith(studentEmail);
    });

    it('should throw HTTP 404 when student does not exist', async () => {
      // Mock the behavior of studentTable.suspendStudent to throw an error
      studentTable.retrieveOneStudent.mockResolvedValue(-1);

      // Call the service function (expecting an error)
      const studentEmail = 'student@example.com';

      // Assert that the function throws an error
      try {
        await service.suspendStudent(studentEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw HTTP 400 when student is already suspended', async () => {
      // Mock the behavior of studentTable.suspendStudent to throw an error
      studentTable.retrieveOneStudent.mockResolvedValue(1);

      // Call the service function (expecting an error)
      const studentEmail = 'student@example.com';

      // Assert that the function throws an error
      try {
        await service.suspendStudent(studentEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw HTTP 500 when error thrown from database', async () => {
      // Mock the behavior of studentTable.suspendStudent to throw an error
      studentTable.retrieveOneStudent.mockResolvedValue(0);
      studentTable.suspendStudent.mockRejectedValue(new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER));

      // Call the service function (expecting an error)
      const studentEmail = 'student@example.com';

      // Assert that the function throws an error
      await expect(service.suspendStudent(studentEmail)).rejects.toThrow(BaseError);

      try {
        await service.suspendStudent(studentEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('Service-retrieveRecipientsForNotifications', () => {
    it('should retrieve recipients successfully', async () => {
        // Mock the behavior of teacherTable.checkTeacherExists and studentTable.getRecipientFromDb
        teacherTable.checkTeacherExists.mockResolvedValue(true);
        studentTable.getRecipientFromDb.mockResolvedValue([
            { email: 'student_under_teacher1@example.com' },
            { email: 'student1@example.com' },
            { email: 'student2@example.com' }
        ]);

        // Call the service function
        const body = {
            teacher: 'teacher@example.com',
            notification: 'Hello students! @student1@example.com @student2@example.com'
        };
        const recipients = await service.retrieveRecipientsForNotifications(body);

        // Assert that teacherTable.checkTeacherExists was called with the expected parameter
        expect(teacherTable.checkTeacherExists).toHaveBeenCalledWith('teacher@example.com');

        // Assert that studentTable.getRecipientFromDb was called with the expected parameters
        expect(studentTable.getRecipientFromDb).toHaveBeenCalledWith('teacher@example.com', [
            'student1@example.com',
            'student2@example.com'
        ]);

        // Assert the return value
        expect(recipients).toEqual(['student_under_teacher1@example.com', 'student1@example.com', 'student2@example.com']);
    });

    it('should retrieve receipents when handle no mentioned students successfully', async () => {
        // Mock the behavior of teacherTable.checkTeacherExists to return true
        teacherTable.checkTeacherExists.mockResolvedValue(true);
        studentTable.getRecipientFromDb.mockResolvedValue([
          { email: 'student_under_teacher1@example.com' },
          { email: 'student_under_teacher2@example.com' }
        ]);

        // Call the service function with no mentioned students
        const body = {
            teacher: 'teacher@example.com',
            notification: 'Hello students!'
        };

        // The result should be an empty array
        const recipients = await service.retrieveRecipientsForNotifications(body);

        // Assert the return value

        expect(recipients).toEqual(['student_under_teacher1@example.com', 'student_under_teacher2@example.com']);
    });

    it('should throw HTTP 404 when teacher not found', async () => {
      // Mock the behavior of teacherTable.checkTeacherExists to return false
      teacherTable.checkTeacherExists.mockResolvedValue(false);

      // Call the service function (expecting HTTP404Error)
      const body = {
          teacher: 'teacher@example.com',
          notification: 'Hello students! @student1@example.com @student2@example.com'
      };

      // Assert that the function throws an HTTP404Error
      try {
        await service.retrieveRecipientsForNotifications(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw HTTP 500 when error thrown from database', async () => {
        // Mock the behavior of teacherTable.checkTeacherExists to return true
        teacherTable.checkTeacherExists.mockResolvedValue(true);

        // Mock the behavior of studentTable.getRecipientFromDb to throw an error
        studentTable.getRecipientFromDb.mockRejectedValue(new BaseError('Database error', httpStatusCodes.INTERNAL_SERVER));

        // Call the service function (expecting an error)
        const body = {
            teacher: 'teacher@example.com',
            notification: 'Hello students! @student1@example.com @student2@example.com'
        };

        // Assert that the function throws an error
        try {
          await service.retrieveRecipientsForNotifications(body);
        } catch (error) {
          expect(error).toBeInstanceOf(BaseError);
          expect(error.statusCode).toBe(500);
        }
    });
  });
});
