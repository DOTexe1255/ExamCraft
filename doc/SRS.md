# Exam Craft — Software Requirements Specification (SRS)

## Project Overview
Exam Craft is a secure web-based exam management system for educational institutes. It provides three role-based interfaces: Institute Admin for oversight, Department for exam creation, and Students for test-taking in locked computer lab browsers. Built with React (Vite) frontend and Node.js (Express + MySQL) backend using JWT authentication.

---

## Functional Requirements

### 1. User Authentication
- Role-based login (admin, department, student) with JWT tokens stored securely.
- Protected routes that redirect unauthorized users.
- Session timeout after 30 minutes of inactivity.
- Password reset via email (integrate Nodemailer).

### 2. Admin Interface
- Manage institutes, departments, and users (CRUD operations).
- Configure global settings: exam duration limits, question banks, Safe Exam Browser keys.
- Generate reports: exam analytics, user activity logs, completion rates.

### 3. Department Interface
- Create / edit exams: title, schedule, duration, max attempts, assigned students.
- Question bank management: add MCQs, true/false, code snippets with multiple options.
- View results: scores, answer sheets, department-wise performance dashboards.

### 4. Student Interface
- View assigned / upcoming exams with start times.
- Exam-taking screen: timer, question navigation, autosave answers every 10 seconds.
- Post-exam: immediate score, detailed feedback, result history.

---

## Non-Functional Requirements
- Performance: Page load < 2s, support 500 concurrent students.
- Security: JWT auth, input sanitization, SEB validation (check user-agent headers), HTTPS enforced.
- Scalability: Stateless backend, MySQL indexing on exam/user queries.
- Accessibility: WCAG 2.1 AA compliant, keyboard navigation for exams.
- Browser Support: Chrome / Edge / Firefox (latest); SEB 3.5+ for lab exams.

---

## Database Schema
text

| Table | Columns |
|---|---|
| users | id, email, password_hash, role (enum), department_id, created_at |
| departments | id, name, admin_id |
| exams | id, title, department_id, start_time, duration_min, total_marks, status |
| questions | id, exam_id, text, type (mcq/code), options JSON, correct_answer |
| student_exam_attempts | id, student_id, exam_id, start_time, score, answers JSON, completed_at |
| results | id, attempt_id, question_id, selected_answer, is_correct |

---

## System Interfaces

### API Endpoints (RESTful)
| Method | Endpoint | Role | Description |
|---:|---|---|---|
| POST | /api/auth/login | All | Returns JWT with role |
| GET | /api/exams | Department / Student | List assigned exams |
| POST | /api/exams/:id/start | Student | Validate SEB, start timer |
| POST | /api/exams/:id/submit | Student | Save final answers |
| GET | /api/admin/reports | Admin | Analytics data |

### Frontend Routes
- /login → Auth form  
- /admin/dashboard, /admin/users, /admin/reports  
- /department/exams, /department/questions  
- /student/exams, /student/exam/:id

---

## Secure Browser Integration
- Safe Exam Browser (SEB) launches student exam URL (/student/exam/:id).
- Backend checks HTTP_USER_AGENT contains "SEB" string before allowing exam start.
- Disable copy/paste, right-click, dev tools, external tabs via SEB config file per exam.

---

## Deployment & Testing
- Dev: Concurrently run backend (nodemon:5000) + frontend (vite:5173).
- Prod: Docker containers (MySQL + Node), Nginx reverse proxy, PM2 process manager.
- Testing: Jest for React components, Postman for APIs, Cypress E2E for exam flow.
- Backup: Daily MySQL dumps, exam data retention 2 years.

---

This SRS provides a complete blueprint; prioritize auth + database setup first, then role dashboards, followed by exam engine and SEB testing.


//------------------------------------  rufles ------------------------

Project Overview
Exam Craft is a secure web-based exam management system for educational institutes. It provides three role-based interfaces: Institute Admin for oversight, Department for exam creation, and Students for test-taking in locked computer lab browsers. Built with React (Vite) frontend and Node.js (Express + MySQL) backend using JWT authentication.​

Functional Requirements
User Authentication
Role-based login (admin, department, student) with JWT tokens stored securely.

Protected routes redirect unauthorized users; session timeout after 30 minutes inactivity.

Password reset via email (integrate Nodemailer).

Admin Interface
Manage institutes, departments, and users (CRUD operations).

Configure global settings: exam duration limits, question banks, Safe Exam Browser keys.

Generate reports: exam analytics, user activity logs, completion rates.

Department Interface
Create/edit exams: title, schedule, duration, max attempts, assigned students.

Question bank management: add MCQs, true/false, code snippets with multiple options.

View results: scores, answer sheets, department-wise performance dashboards.

Student Interface
View assigned/upcoming exams with start times.

Exam-taking screen: timer, question navigation, autosave answers every 10 seconds.

Post-exam: immediate score, detailed feedback, result history.

Non-Functional Requirements
Performance: Page load <2s, support 500 concurrent students.

Security: JWT auth, input sanitization, SEB validation (check user-agent headers), HTTPS enforced.

Scalability: Stateless backend, MySQL indexing on exam/user queries.

Accessibility: WCAG 2.1 AA compliant, keyboard navigation for exams.

Browser Support: Chrome/Edge/Firefox latest; SEB 3.5+ for lab exams.

Database Schema
text
users: id, email, password_hash, role (enum), department_id, created_at
departments: id, name, admin_id
exams: id, title, department_id, start_time, duration_min, total_marks, status
questions: id, exam_id, text, type (mcq/code), options JSON, correct_answer
student_exam_attempts: id, student_id, exam_id, start_time, score, answers JSON, completed_at
results: id, attempt_id, question_id, selected_answer, is_correct
System Interfaces
API Endpoints (RESTful):

Method	Endpoint	Role	Description
POST	/api/auth/login	All	Returns JWT with role
GET	/api/exams	Department/Student	List assigned exams
POST	/api/exams/:id/start	Student	Validate SEB, start timer
POST	/api/exams/:id/submit	Student	Save final answers
GET	/api/admin/reports	Admin	Analytics data
Frontend Routes:

/login → Auth form

/admin/dashboard, /admin/users, /admin/reports

/department/exams, /department/questions

/student/exams, /student/exam/:id

Secure Browser Integration
Safe Exam Browser (SEB) launches student exam URL (/student/exam/:id).

Backend checks HTTP_USER_AGENT contains "SEB" string before allowing exam start.

Disable: copy/paste, right-click, dev tools, external tabs via SEB config file per exam.

Deployment & Testing
Dev: Concurrently run backend (nodemon:5000) + frontend (vite:5173).

Prod: Docker containers (MySQL + Node), Nginx reverse proxy, PM2 process manager.

Testing: Jest for React components, Postman for APIs, Cypress E2E for exam flow.

Backup: Daily MySQL dumps, exam data retention 2 years.

This SRS provides a complete blueprint; prioritize auth + database setup first, then role dashboards, followed by exam engine and SEB testing.