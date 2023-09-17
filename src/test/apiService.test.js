const service = require('../services/apiService.js'); // Import your service module
const teacherTable = require('../database/teacherTable.js');
const studentTable = require('../database/studentTable.js');
const relationshipTable = require('../database/relationshipTable.js');
const HTTP400Error = require('../exceptions/badRequest.js');
const HTTP404Error = require('../exceptions/notFound.js');
const HTTP409Error = require('../exceptions/conflictError.js');
const HTTP500Error = require('../exceptions/apiError.js');


jest.mock('../database/teacherTable.js', () => ({
    checkTeacherExists: jest.fn()
}));

jest.mock('../database/studentTable.js', () => ({
    checkStudentExists: jest.fn(),
    insertNewStudent: jest.fn(),
    suspendStudent: jest.fn(),
    getRecipientFromDb: jest.fn()
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

  describe('registerStudent', () => {
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
      expect(studentTable.insertNewStudent).not.toHaveBeenCalledWith('student2@example.com'); // Student already existed
      expect(relationshipTable.registerStudentTeacherRelationship).toHaveBeenCalledWith('teacher@example.com', 'student1@example.com');
      expect(relationshipTable.registerStudentTeacherRelationship).toHaveBeenCalledWith('teacher@example.com', 'student2@example.com');
    });

    it('should throw HTTP404Error when teacher not found ', async () => {
      // Mock database function and simulate teacher not found
      teacherTable.checkTeacherExists.mockResolvedValue(false);
  
      // Create a mock request body
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };
  
      await expect(service.registerStudent(body)).rejects.toThrow(HTTP404Error);
    });
  
    it('should throw HTTP400Error when handle invalid student email format', async () => {
      // Mock database functions and expected behavior
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      studentTable.checkStudentExists.mockResolvedValue(false);
  
      // Create a mock request body with an invalid email format
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'invalid-email'],
      };
  
      await expect(service.registerStudent(body)).rejects.toThrow(HTTP400Error);
    });
  
    it('should throw HTTP409Error when student already registered', async () => {
      // Mock database functions and simulate student already registered
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      studentTable.checkStudentExists.mockResolvedValue(true);
      relationshipTable.checkRelationshipExists.mockResolvedValue([{ student_email: 'student1@example.com' }]);
  
      // Create a mock request body
      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };
  
      await expect(service.registerStudent(body)).rejects.toThrow(HTTP409Error);
    });

    it('should throw HTTP500Error when error thrown from database', async () => {
      // Mock database functions
      teacherTable.checkTeacherExists.mockResolvedValue(true);
      relationshipTable.checkRelationshipExists.mockResolvedValue([]);
      studentTable.checkStudentExists.mockResolvedValue(true);
      
      
      // relationshipTable.registerStudentTeacherRelationship.mockResolvedValue();

      const body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com'],
      };

      const errorMessage = 'Database error';

      relationshipTable.registerStudentTeacherRelationship.mockImplementation(() => {
        throw new HTTP500Error(errorMessage);
      });

      await expect(service.registerStudent(body)).rejects.toThrow(HTTP500Error);

    });
  });

  describe('findCommonStudents', () => {
    it('should return common students successfully', async () => {
      // Mock the behavior of relationshipTable.findCommonStudentsRelationship
      relationshipTable.findCommonStudentsRelationship.mockResolvedValue([
          { student_email: 'student1@example.com' },
          { student_email: 'student2@example.com' },
      ]);

      // Call the service function
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const commonStudents = await service.findCommonStudents(teacherEmails);

      // Assert that relationshipTable.findCommonStudentsRelationship was called with the expected parameter
      expect(relationshipTable.findCommonStudentsRelationship).toHaveBeenCalledWith(teacherEmails);

      // Assert the return value
      expect(commonStudents).toEqual(['student1@example.com', 'student2@example.com']);
    });

    it('should throw HTTP500Error when error thrown from database', async () => {
        // Mock the behavior of relationshipTable.findCommonStudentsRelationship to throw an error
        relationshipTable.findCommonStudentsRelationship.mockRejectedValue(new HTTP500Error('Database error'));

        // Call the service function (expecting an error)
        const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];

        // Assert that the function throws an error
        await expect(service.findCommonStudents(teacherEmails)).rejects.toThrow(HTTP500Error);
    });
  });

  describe('suspendStudent', () => {
    it('should suspend a student successfully', async () => {
      // Mock the behavior of studentTable.suspendStudent
      studentTable.suspendStudent.mockResolvedValue();

      // Call the service function
      const studentEmail = 'student@example.com';
      await service.suspendStudent(studentEmail);

      // Assert that studentTable.suspendStudent was called with the expected parameter
      expect(studentTable.suspendStudent).toHaveBeenCalledWith(studentEmail);
    });

    it('should throw HTTP500Error when error thrown from database', async () => {
      // Mock the behavior of studentTable.suspendStudent to throw an error
      studentTable.suspendStudent.mockRejectedValue(new HTTP500Error('Database error'));

      // Call the service function (expecting an error)
      const studentEmail = 'student@example.com';

      // Assert that the function throws an error
      await expect(service.suspendStudent(studentEmail)).rejects.toThrow(HTTP500Error);
    });
  });

  describe('retrieveRecipientsForNotifications', () => {
    it('should retrieve recipients for notifications successfully', async () => {
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

    it('should throw HTTP404Error when teacher not found', async () => {
        // Mock the behavior of teacherTable.checkTeacherExists to return false
        teacherTable.checkTeacherExists.mockResolvedValue(false);

        // Call the service function (expecting HTTP404Error)
        const body = {
            teacher: 'teacher@example.com',
            notification: 'Hello students! @student1@example.com @student2@example.com'
        };

        // Assert that the function throws an HTTP404Error
        await expect(service.retrieveRecipientsForNotifications(body)).rejects.toThrow(HTTP404Error);
    });

    it('should handle no mentioned students successfully', async () => {
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

    it('should throw HTTP500Error when error thrown from database', async () => {
        // Mock the behavior of teacherTable.checkTeacherExists to return true
        teacherTable.checkTeacherExists.mockResolvedValue(true);

        // Mock the behavior of studentTable.getRecipientFromDb to throw an error
        studentTable.getRecipientFromDb.mockRejectedValue(new HTTP500Error('Database error'));

        // Call the service function (expecting an error)
        const body = {
            teacher: 'teacher@example.com',
            notification: 'Hello students! @student1@example.com @student2@example.com'
        };

        // Assert that the function throws an error
        await expect(service.retrieveRecipientsForNotifications(body)).rejects.toThrow(HTTP500Error);
    });
  });
});
