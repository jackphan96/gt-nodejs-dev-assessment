-- Create schema
CREATE DATABASE  IF NOT EXISTS `teacher_student_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `teacher_student_db`;

DROP TABLE IF EXISTS `student`;

-- Create table 'student'

CREATE TABLE `student` (
  `email` varchar(100) NOT NULL,
  `is_suspended` tinyint DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `teacher`;

-- Create table 'teacher'

CREATE TABLE `teacher` (
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `teacher_student_rs`;

-- Create value for table 'teacher'
INSERT INTO `teacher` VALUES ('teacherjoe@gmail.com'),('teacherken@gmail.com');

-- Create table 'teacher_student_rs'

CREATE TABLE `teacher_student_rs` (
  `teacher_email` varchar(100) NOT NULL,
  `student_email` varchar(100) NOT NULL,
  PRIMARY KEY (`teacher_email`,`student_email`),
  KEY `student_email_idx` (`student_email`),
  CONSTRAINT `student_email` FOREIGN KEY (`student_email`) REFERENCES `student` (`email`),
  CONSTRAINT `teacher_email` FOREIGN KEY (`teacher_email`) REFERENCES `teacher` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;