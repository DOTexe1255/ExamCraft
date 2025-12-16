-- Full Normalized MySQL Database for Exam Craft (3NF)
-- Create database
CREATE DATABASE examcraft;
USE examcraft;

-- 1. Institutes (for multi-institute support)
CREATE TABLE institutes (
    institute_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    contact_email VARCHAR(100),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- 2. Departments (belongs to institute)
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    head_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE CASCADE,
    UNIQUE KEY unique_inst_dept (institute_id, code),
    INDEX idx_institute (institute_id)
);

-- 3. Users (normalized roles, no redundancy)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    department_id INT NULL,  -- NULL for admin
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'department', 'student') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_dept (department_id)
);

-- 4. User Profiles (1:1 extension for additional details)
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    enrollment_no VARCHAR(20) UNIQUE,  -- For students
    employee_id VARCHAR(20),           -- For staff
    date_of_birth DATE,
    gender ENUM('M', 'F', 'O'),
    profile_image VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Exam Categories (question types)
CREATE TABLE question_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name ENUM('mcq', 'true_false', 'short_answer', 'code') NOT NULL,
    max_marks INT DEFAULT 1,
    has_options BOOLEAN DEFAULT TRUE
);

-- 6. Exams (normalized - no question data here)
CREATE TABLE exams (
    exam_id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    department_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_datetime DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    max_attempts INT DEFAULT 1,
    status ENUM('draft', 'scheduled', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    seb_required BOOLEAN DEFAULT TRUE,  -- Safe Exam Browser
    seb_quit_password VARCHAR(50),
    instructions TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_dept_time (department_id, start_datetime),
    INDEX idx_status (status)
);

-- 7. Questions (normalized - separate from exams)
CREATE TABLE questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    type_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_image VARCHAR(255) NULL,
    options JSON,  -- [{"option": "A", "is_correct": true}, ...]
    correct_answer JSON,  -- For non-MCQ or complex answers
    max_marks INT NOT NULL DEFAULT 1,
    explanation TEXT,
    order_sequence INT DEFAULT 0,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES question_types(type_id),
    INDEX idx_exam_order (exam_id, order_sequence)
);

-- 8. Exam Assignments (many-to-many: exams to students)
CREATE TABLE exam_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_exam_student (exam_id, student_id),
    INDEX idx_student (student_id)
);

-- 9. Exam Attempts (one student can have multiple attempts per exam)
CREATE TABLE exam_attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_taken INT,  -- seconds
    total_score DECIMAL(5,2) DEFAULT 0,
    total_marks INT NOT NULL,
    is_submitted BOOLEAN DEFAULT FALSE,
    seb_verified BOOLEAN DEFAULT FALSE,  -- Safe Exam Browser validation
    user_agent VARCHAR(500),  -- For SEB detection
    FOREIGN KEY (assignment_id) REFERENCES exam_assignments(assignment_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    INDEX idx_student_exam (student_id, exam_id),
    INDEX idx_status (is_submitted)
);

-- 10. Student Answers (normalized per question)
CREATE TABLE student_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer JSON,  -- Student response
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    time_spent INT DEFAULT 0,  -- seconds
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    INDEX idx_attempt (attempt_id),
    INDEX idx_question (question_id)
);

-- 11. Audit Logs (for admin tracking)
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_action (action)
);



-- 12. Subjects/Courses (exams belong to specific subjects)
CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    credits INT DEFAULT 4,
    syllabus TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    INDEX idx_dept (department_id)
);

-- Update exams table to include subject
ALTER TABLE exams ADD COLUMN subject_id INT AFTER department_id,
ADD FOREIGN KEY (subject_id) REFERENCES subjects(subject_id);

-- 13. Question Bank (reusable questions across multiple exams)
CREATE TABLE question_bank (
    qbank_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    type_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON,
    correct_answer JSON,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    tags JSON,  -- ["arrays", "sorting"]
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (type_id) REFERENCES question_types(type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FULLTEXT(question_text)
);

-- Update questions table to reference question_bank
ALTER TABLE questions ADD COLUMN qbank_id INT AFTER type_id,
ADD FOREIGN KEY (qbank_id) REFERENCES question_bank(qbank_id);

-- 14. Notifications (email/SMS alerts)
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('exam_scheduled', 'results_ready', 'reminder') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_read (user_id, is_read)
);

-- 15. Exam Sessions (for lab-based proctored exams)
CREATE TABLE exam_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    lab_name VARCHAR(100),
    session_date DATETIME NOT NULL,
    capacity INT NOT NULL,
    seats_filled INT DEFAULT 0,
    status ENUM('open', 'ongoing', 'closed') DEFAULT 'open',
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- 16. File Uploads (question images, student docs)
CREATE TABLE file_uploads (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_type ENUM('question_image', 'profile_photo', 'document') NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_type (user_id, file_type)
);

-- 17. Settings (institute-wide configurations)
CREATE TABLE institute_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    institute_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (institute_id, setting_key),
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id)
);

-- -- Sample Data
-- INSERT INTO institutes (name, code, contact_email) VALUES 
-- ('Tech Institute', 'TI001', 'admin@techinst.com');

-- INSERT INTO departments (institute_id, name, code) VALUES 
-- (1, 'Computer Science', 'CS'),
-- (1, 'Electronics', 'ECE');

-- INSERT INTO users (institute_id, department_id, email, password_hash, role, first_name, last_name) VALUES 
-- (1, 1, 'admin@techinst.com', '$2b$10$...', 'admin', 'Admin', 'User'),
-- (1, 1, 'cshead@techinst.com', '$2b$10$...', 'department', 'CS', 'Head'),
-- (1, 1, 'student1@techinst.com', '$2b$10$...', 'student', 'John', 'Doe');

-- -- Indexes for performance
-- CREATE INDEX idx_exams_dept_status ON exams(department_id, status);
-- CREATE INDEX idx_users_role_active ON users(role, is_active);


-- Insert default question types
-- INSERT INTO question_types (type_name, max_marks, has_options) VALUES
-- ('mcq', 1, TRUE),
-- ('true_false', 1, TRUE),
-- ('short_answer', 2, FALSE),
-- ('code', 5, FALSE);

-- -- Sample subjects
-- INSERT INTO subjects (department_id, subject_code, name) VALUES
-- (1, 'CS101', 'Data Structures'),
-- (1, 'CS102', 'Algorithms');
