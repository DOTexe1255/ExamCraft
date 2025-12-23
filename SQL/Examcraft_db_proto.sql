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



-- -- ---------------------------------------------------   Sample Data  ------------------------------

-- Sample Data for Exam Craft Testing (Run after creating all tables)
USE examcraft;

-- 1. Institutes
INSERT INTO institutes (name, code, address, contact_email, phone) VALUES
('Tech Institute Pune', 'TI001', 'Pune, Maharashtra', 'admin@techinst.com', '9876543210'),
('Global Engineering College', 'GEC002', 'Bangalore, Karnataka', 'admin@gec.edu', '9876543211');

-- 2. Departments
INSERT INTO departments (institute_id, name, code, head_email) VALUES
(1, 'Computer Science', 'CS', 'cshead@techinst.com'),
(1, 'Electronics', 'ECE', 'ecehead@techinst.com'),
(2, 'Information Technology', 'IT', 'ithead@gec.edu');

-- 3. Subjects
INSERT INTO subjects (department_id, subject_code, name, credits) VALUES
(1, 'CS101', 'Data Structures', 4),
(1, 'CS102', 'Algorithms', 4),
(2, 'ECE101', 'Digital Electronics', 4),
(3, 'IT101', 'Web Technologies', 4);

-- 4. Question Types (if not inserted earlier)
INSERT IGNORE INTO question_types (type_name, max_marks, has_options) VALUES
('mcq', 1, TRUE),
('true_false', 1, TRUE),
('short_answer', 2, FALSE),
('code', 5, FALSE);

-- 5. Users (passwords: 'password123' hashed with bcrypt)
INSERT INTO users (institute_id, department_id, email, password_hash, role, first_name, last_name, phone, is_active) VALUES
-- Admins
(1, NULL, 'admin@techinst.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Super', 'Admin', '9876543210', TRUE),
(2, NULL, 'gecadmin@gec.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'GEC', 'Admin', '9876543211', TRUE),

-- Department Heads
(1, 1, 'cshead@techinst.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 'CS', 'Head', '9876543212', TRUE),
(1, 2, 'ecehead@techinst.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 'ECE', 'Head', '9876543213', TRUE),

-- Students
(1, 1, 'john.doe@techinst.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'John', 'Doe', '9876543214', TRUE),
(1, 1, 'jane.smith@techinst.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Jane', 'Smith', '9876543215', TRUE),
(2, 3, 'alice.it@gec.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Alice', 'IT', '9876543216', TRUE);

-- 6. User Profiles
INSERT INTO user_profiles (user_id, enrollment_no, employee_id, date_of_birth, gender) VALUES
(5, 'CS2024001', NULL, '2003-05-15', 'M'),  -- John Doe
(6, 'CS2024002', NULL, '2003-08-22', 'F'),  -- Jane Smith
(7, 'IT2024001', NULL, '2004-01-10', 'F');  -- Alice IT

-- 7. Institute Settings
INSERT INTO institute_settings (institute_id, setting_key, setting_value) VALUES
(1, 'logo_url', '/uploads/techinst-logo.png'),
(1, 'max_exam_duration', '120'),
(1, 'seb_quit_password', 'exam123'),
(2, 'logo_url', '/uploads/gec-logo.png'),
(2, 'max_exam_duration', '90');

-- 8. Exams (2 upcoming, 1 completed)
INSERT INTO exams (institute_id, department_id, subject_id, title, description, start_datetime, duration_minutes, total_marks, max_attempts, status, seb_required, seb_quit_password, instructions, created_by) VALUES
-- CS Data Structures Midterm (Upcoming)
(1, 1, 1, 'Data Structures Midterm Exam', 'Midterm covering Arrays, Linked Lists, Stacks', '2025-12-25 10:00:00', 90, 50, 1, 'scheduled', TRUE, 'midterm2025', 'No external resources allowed', 3),

-- ECE Quiz (Active)
(1, 2, 3, 'Digital Electronics Quiz 1', 'Logic gates and Boolean algebra', '2025-12-23 14:00:00', 45, 25, 1, 'active', TRUE, 'quiz1', 'Use SEB browser only', 4),

-- IT Final Exam (Completed)
(2, 3, 4, 'Web Technologies Final Exam', 'Final exam results available', '2025-12-20 09:00:00', 120, 100, 1, 'completed', TRUE, 'final2025', 'Results published', 2);

-- 9. Question Bank (Reusable questions)
INSERT INTO question_bank (subject_id, type_id, question_text, options, correct_answer, difficulty, tags, created_by) VALUES
(1, 1, 'What is the time complexity of accessing an element in an array?', 
 '[{"option": "O(1)", "is_correct": true}, {"option": "O(n)", "is_correct": false}, {"option": "O(log n)", "is_correct": false}, {"option": "O(n^2)", "is_correct": false}]', 
 '[{"option": "O(1)"}]', 'easy', '["arrays", "time_complexity"]', 3),
 
(1, 2, 'Linked lists are better than arrays for frequent insertions/deletions.', 
 '[{"option": "True", "is_correct": true}, {"option": "False", "is_correct": false}]', 
 '[{"option": "True"}]', 'medium', '["linked_lists"]', 3);

-- 10. Questions (linked to specific exams)
INSERT INTO questions (exam_id, type_id, qbank_id, question_text, options, correct_answer, max_marks, order_sequence) VALUES
(1, 1, 1, 'What is the time complexity of accessing an element in an array?', 
 '[{"option": "O(1)", "is_correct": true}, {"option": "O(n)", "is_correct": false}, {"option": "O(log n)", "is_correct": false}, {"option": "O(n^2)", "is_correct": false}]', 
 '[{"option": "O(1)"}]', 2, 1),

(1, 2, 2, 'Linked lists are better than arrays for frequent insertions/deletions.', 
 '[{"option": "True", "is_correct": true}, {"option": "False", "is_correct": false}]', 
 '[{"option": "True"}]', 1, 2);

-- 11. Exam Assignments
INSERT INTO exam_assignments (exam_id, student_id) VALUES
(1, 5),  -- John Doe - Data Structures
(1, 6),  -- Jane Smith - Data Structures
(3, 7);  -- Alice - Web Technologies

-- 12. Exam Attempts (with sample results)
INSERT INTO exam_attempts (assignment_id, student_id, exam_id, started_at, completed_at, duration_taken, total_score, total_marks, is_submitted, seb_verified) VALUES
(1, 5, 1, '2025-12-25 10:05:00', '2025-12-25 11:20:00', 4500, 42.00, 50, TRUE, TRUE),
(2, 6, 1, '2025-12-25 10:07:00', '2025-12-25 11:25:00', 4680, 38.50, 50, TRUE, TRUE),
(3, 7, 3, '2025-12-20 09:10:00', '2025-12-20 11:05:00', 6600, 85.00, 100, TRUE, TRUE);

-- 13. Student Answers
INSERT INTO student_answers (attempt_id, question_id, selected_answer, marks_obtained, time_spent) VALUES
(1, 1, '[{"option": "O(1)"}]', 2.00, 45),  -- John got Q1 correct
(1, 2, '[{"option": "True"}]', 1.00, 120), -- John got Q2 correct
(2, 1, '[{"option": "O(n)"}]', 0.00, 60),  -- Jane got Q1 wrong
(2, 2, '[{"option": "True"}]', 1.00, 90);  -- Jane got Q2 correct

-- 14. Notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(5, 'Exam Reminder', 'Data Structures Midterm tomorrow at 10AM', 'reminder'),
(6, 'Exam Reminder', 'Data Structures Midterm tomorrow at 10AM', 'reminder'),
(7, 'Results Available', 'Web Technologies Final Exam results published', 'results_ready');

-- 15. Exam Sessions (Lab batches)
INSERT INTO exam_sessions (exam_id, lab_name, session_date, capacity, seats_filled) VALUES
(1, 'Lab A-101', '2025-12-25 10:00:00', 30, 2),
(1, 'Lab A-102', '2025-12-25 14:00:00', 30, 0);

-- 16. Audit Logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address) VALUES
(3, 'EXAM_CREATED', 'exams', 1, '192.168.1.100'),
(5, 'EXAM_STARTED', 'exam_attempts', 1, '192.168.1.101');



-- Check data loaded
SELECT COUNT(*) FROM users;  -- Should return 7
SELECT * FROM exams WHERE status = 'scheduled';  -- Upcoming exams
SELECT u.first_name, e.title, ea.total_score FROM users u 
JOIN exam_attempts ea ON u.user_id = ea.student_id 
JOIN exams e ON ea.exam_id = e.exam_id;


-- ------------------------------------------------- Sample User Credentials:  ------------------------------------

-- Admin: admin@techinst.com / password123
-- CS Head: cshead@techinst.com / password123  
-- Students: john.doe@techinst.com / password123
