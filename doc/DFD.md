# ExamCraft Data Flow Diagrams

This document describes how data moves through the ExamCraft online
examination management system. The diagrams use Mermaid flowcharts:

- `E` indicates an external entity.
- `P` indicates a process.
- `D` indicates a data store.
- Arrows are labelled with the main data being transferred.

The flows are based on the backend route modules registered in
`backend/index.js` and the relational data stores defined in
`database/Examcraft_db_proto.sql`.

## 1. Context-Level DFD

ExamCraft is represented as one system. External users exchange requests,
configuration, exam data, answers, and reports with the system.

```mermaid
flowchart LR
    IA["E1 Institute Admin"]
    DA["E2 Department Admin / Teacher"]
    ST["E3 Student"]
    SYS(("P0 ExamCraft Online Examination System"))
    DB[("D1 ExamCraft MySQL Database")]

    IA -->|"Institute registration, department data, settings, report requests"| SYS
    SYS -->|"Dashboard data, department status, reports, activity logs"| IA

    DA -->|"Login, student data, exam definitions, question banks"| SYS
    SYS -->|"Student lists, exam status, live monitoring, results"| DA

    ST -->|"Login, exam requests, answers, heartbeat, submission"| SYS
    SYS -->|"Available exams, instructions, timer state, result status"| ST

    SYS <-->|"Users, institutes, exams, questions, attempts, answers, logs"| DB
```

## 2. Level 1 DFD: Main System Processes

```mermaid
flowchart TB
    IA["E1 Institute Admin"]
    DA["E2 Department Admin / Teacher"]
    ST["E3 Student"]

    P1(("1.0 Authenticate Users"))
    P2(("2.0 Manage Institute and Departments"))
    P3(("3.0 Manage Students and Profiles"))
    P4(("4.0 Create and Schedule Exams"))
    P5(("5.0 Manage Question Banks"))
    P6(("6.0 Deliver Exam and Process Answers"))
    P7(("7.0 Monitor Attempts and Generate Reports"))
    P8(("8.0 Manage Notifications, Files, Settings, and Audit"))

    D1[("D1 Users and Profiles")]
    D2[("D2 Institutes and Departments")]
    D3[("D3 Subjects")]
    D4[("D4 Exams and Questions")]
    D5[("D5 Question Banks")]
    D6[("D6 Assignments, Attempts, and Answers")]
    D7[("D7 Proctoring and Activity Logs")]
    D8[("D8 Notifications, Files, Settings, and Audit Logs")]

    IA -->|"Registration and login"| P1
    DA -->|"Login"| P1
    ST -->|"Login"| P1
    P1 <--> D1
    P1 -->|"Authenticated session and role"| IA
    P1 -->|"Authenticated session and role"| DA
    P1 -->|"Authenticated session and role"| ST

    IA -->|"Institute and department commands"| P2
    P2 <--> D2
    P2 -->|"Institute structure and dashboard data"| IA

    DA -->|"Student registration and access changes"| P3
    P3 <--> D1
    P3 <--> D2
    P3 -->|"Student list and access status"| DA

    DA -->|"Exam metadata, schedule, sections, students"| P4
    P4 <--> D3
    P4 <--> D4
    P4 <--> D6
    P4 -->|"Exam confirmation and details"| DA

    DA -->|"Reusable questions and question groups"| P5
    P5 <--> D5
    P5 -->|"Question bank list and saved group"| DA

    ST -->|"Start, heartbeat, answer, submit"| P6
    P6 <--> D4
    P6 <--> D6
    P6 <--> D7
    P6 -->|"Exam paper, timer, save status, result status"| ST

    DA -->|"Live exam and report request"| P7
    IA -->|"Institute report request"| P7
    P7 <--> D4
    P7 <--> D6
    P7 <--> D7
    P7 -->|"Live monitoring and reports"| DA
    P7 -->|"Institute report and activity"| IA

    IA -->|"Settings and activity review"| P8
    DA -->|"Exam notifications and uploads"| P8
    P8 <--> D8
    P8 -->|"Settings, notifications, audit data"| IA
    P8 -->|"Notifications and upload status"| DA
```

## 3. Authentication and Authorization DFD

Relevant routes include `/api/auth/login`, registration endpoints,
`/api/auth/verify`, and the shared authentication middleware.

```mermaid
flowchart LR
    U["E1 User"]
    P11(("1.1 Validate Credentials"))
    P12(("1.2 Hash / Compare Password"))
    P13(("1.3 Create HttpOnly JWT Cookie"))
    P14(("1.4 Verify Token and Role"))
    D11[("D1 Users")]
    D12[("D2 Institutes and Departments")]

    U -->|"Email, password, role"| P11
    P11 -->|"User lookup"| D11
    D11 -->|"Stored hash and role"| P11
    P11 -->|"Password comparison"| P12
    P12 -->|"Valid credentials"| P13
    P13 -->|"JWT cookie and user summary"| U
    U -->|"Cookie on protected request"| P14
    P14 -->|"User and role lookup"| D11
    P14 -->|"Institute / department scope"| D12
    P14 -->|"Authorized request context"| P15(("Protected API Route"))
    P15 -->|"Response or access denied"| U
```

## 4. Institute Administration DFD

This flow covers institute creation, department administration, dashboard
statistics, settings, activity data, and institute reports.

```mermaid
flowchart TB
    IA["E1 Institute Admin"]
    P21(("2.1 Register Institute"))
    P22(("2.2 Manage Departments"))
    P23(("2.3 Build Institute Dashboard"))
    P24(("2.4 Generate Institute CSV Report"))
    D21[("D1 Institutes")]
    D22[("D2 Departments")]
    D23[("D3 Users")]
    D24[("D4 Exams")]
    D25[("D5 Audit Logs")]
    D26[("D6 Institute Settings")]

    IA -->|"Name, code, address, contact details"| P21
    P21 <--> D21
    P21 -->|"Institute ID and creation status"| IA

    IA -->|"Department name, code, head email"| P22
    P22 <--> D21
    P22 <--> D22
    P22 <--> D23
    P22 -->|"Department and administrator status"| IA

    IA -->|"Dashboard request"| P23
    P23 -->|"Institute scope"| D21
    P23 -->|"Department and head data"| D22
    P23 -->|"Student and faculty counts"| D23
    P23 -->|"Active and total exam counts"| D24
    P23 -->|"Activity and settings"| D25
    P23 -->|"Settings"| D26
    P23 -->|"Summary, departments, activity, settings"| IA

    IA -->|"Report request"| P24
    P24 -->|"Department and user counts"| D22
    P24 -->|"Exam counts"| D24
    P24 -->|"CSV report"| IA
```

## 5. Department Administration and Exam Authoring DFD

Relevant routes include `/api/department`, `/api/department/dashboard`, and
the exam creation and update routes under `/api/exams`.

```mermaid
flowchart LR
    DA["E1 Department Admin / Teacher"]
    P31(("3.1 Load Department Context"))
    P32(("3.2 Manage Students"))
    P33(("3.3 Validate Exam Definition"))
    P34(("3.4 Save Exam and Questions"))
    P35(("3.5 Assign Students"))
    D31[("D1 Users")]
    D32[("D2 Departments")]
    D33[("D3 Exams")]
    D34[("D4 Questions")]
    D35[("D5 Exam Assignments")]
    D36[("D6 Question Bank Groups")]

    DA -->|"Dashboard request"| P31
    P31 --> D31
    P31 --> D32
    P31 --> D33
    P31 -->|"Students, exams, statistics"| DA

    DA -->|"Student registration, access update"| P32
    P32 <--> D31
    P32 -->|"Student operation result"| DA

    DA -->|"Title, schedule, duration, marks, security"| P33
    P33 -->|"Validated exam payload"| P34
    P34 <--> D33
    P34 <--> D34
    P34 <--> D36
    P34 -->|"Exam saved"| DA

    DA -->|"Selected student IDs"| P35
    P35 --> D31
    P35 <--> D35
    P35 -->|"Assignment status"| DA
```

## 6. Question Bank DFD

Relevant routes are `GET /api/question-banks` and `POST /api/question-banks`.

```mermaid
flowchart TB
    DA["E1 Department Admin / Teacher"]
    P41(("4.1 Select Institute and Department Scope"))
    P42(("4.2 Normalize Questions and Sections"))
    P43(("4.3 Save Question Bank Group"))
    P44(("4.4 List Question Banks"))
    D41[("D1 Users")]
    D42[("D2 Institutes and Departments")]
    D43[("D3 Question Bank Groups")]

    DA -->|"Authenticated request and scope"| P41
    P41 --> D41
    P41 --> D42
    P41 -->|"Resolved institute and department"| P42
    DA -->|"Group name, metadata, sections, questions"| P42
    P42 -->|"Normalized JSON payload and count"| P43
    P43 --> D43
    P43 -->|"Saved bank ID and question count"| DA
    DA -->|"List request"| P44
    P44 --> D43
    P44 -->|"Parsed question bank groups"| DA
```

## 7. Student Exam Delivery DFD

Relevant routes include exam instructions, start, status, heartbeat,
save-answer, and submit endpoints under `/api/exams/:examId`.

```mermaid
flowchart TB
    ST["E1 Student"]
    P51(("5.1 Check Assignment and Exam Window"))
    P52(("5.2 Create or Resume Attempt"))
    P53(("5.3 Deliver Questions and Timer"))
    P54(("5.4 Save Answer / Heartbeat"))
    P55(("5.5 Submit and Calculate Score"))
    D51[("D1 Users")]
    D52[("D2 Exams and Questions")]
    D53[("D3 Exam Assignments")]
    D54[("D4 Exam Attempts")]
    D55[("D5 Student Answers")]
    D56[("D6 Activity Logs")]

    ST -->|"Exam ID and authenticated request"| P51
    P51 --> D51
    P51 --> D52
    P51 --> D53
    P51 -->|"Eligible assignment and exam window"| P52
    P52 <--> D54
    P52 -->|"Attempt ID and start state"| P53
    P53 --> D52
    P53 -->|"Instructions, questions, duration"| ST

    ST -->|"Answer changes and heartbeat"| P54
    P54 <--> D54
    P54 <--> D55
    P54 --> D56
    P54 -->|"Save confirmation and remaining time"| ST

    ST -->|"Final submission"| P55
    P55 --> D54
    P55 --> D55
    P55 --> D52
    P55 --> D56
    P55 -->|"Score, submission status, result state"| ST
```

## 8. Live Monitoring and Reporting DFD

This flow covers department live-exam monitoring, forced submission, exam
reports, and institute-level reporting.

```mermaid
flowchart LR
    DA["E1 Department Admin / Teacher"]
    IA["E2 Institute Admin"]
    P61(("6.1 Aggregate Live Attempt State"))
    P62(("6.2 Force Submit Attempt"))
    P63(("6.3 Generate Exam Report"))
    P64(("6.4 Generate Institute Report"))
    D61[("D1 Exams")]
    D62[("D2 Users and Departments")]
    D63[("D3 Assignments and Attempts")]
    D64[("D4 Answers and Results")]
    D65[("D5 Activity and Audit Logs")]

    DA -->|"Live dashboard request"| P61
    P61 --> D61
    P61 --> D63
    P61 --> D65
    P61 -->|"Active students, progress, violations"| DA

    DA -->|"Exam ID and student ID"| P62
    P62 <--> D63
    P62 --> D64
    P62 --> D65
    P62 -->|"Force-submit result"| DA

    DA -->|"Exam report request"| P63
    P63 --> D61
    P63 --> D63
    P63 --> D64
    P63 -->|"Exam results and analytics"| DA

    IA -->|"Institute report request"| P64
    P64 --> D62
    P64 --> D61
    P64 -->|"Department, student, faculty, and active-exam CSV"| IA
```

## 9. Coding Execution DFD

Coding questions use the `/api/run` route and store submissions alongside the
student's exam attempt.

```mermaid
flowchart TB
    ST["E1 Student"]
    P71(("7.1 Validate Coding Submission"))
    P72(("7.2 Execute in Code Runner"))
    P73(("7.3 Compare Output and Grade"))
    D71[("D1 Coding Question Details")]
    D72[("D2 Exam Attempts")]
    D73[("D3 Coding Submissions")]
    D74[("D4 Student Answers")]

    ST -->|"Language, source code, input, question ID"| P71
    P71 --> D71
    P71 --> D72
    P71 -->|"Validated source code and test cases"| P72
    P72 -->|"Execution output, errors, runtime"| P73
    P73 --> D71
    P73 --> D73
    P73 --> D74
    P73 -->|"Accepted, wrong answer, compile/runtime result and marks"| ST
```

## 10. Supporting Services DFD

```mermaid
flowchart TB
    U["E1 Authenticated User"]
    P81(("8.1 Create Notification"))
    P82(("8.2 Upload File"))
    P83(("8.3 Read or Update Institute Setting"))
    P84(("8.4 Record Audit Event"))
    D81[("D1 Notifications")]
    D82[("D2 File Uploads")]
    D83[("D3 Institute Settings")]
    D84[("D4 Audit Logs")]
    D85[("D5 Institutes and Users")]

    U -->|"Exam event or notification request"| P81
    P81 --> D81
    D81 -->|"Unread notification"| U

    U -->|"Question image, profile photo, or document"| P82
    P82 --> D82
    P82 -->|"File metadata and upload status"| U

    U -->|"Setting key and value"| P83
    P83 --> D85
    P83 <--> D83
    P83 -->|"Configuration status"| U

    P81 -->|"Notification event"| P84
    P82 -->|"Upload event"| P84
    P83 -->|"Settings event"| P84
    U -->|"User action context"| P84
    P84 --> D84
```

## 11. Main End-to-End Data Flow

```mermaid
flowchart LR
    A["Institute Registration"] --> B["Admin Authentication"]
    B --> C["Department and User Setup"]
    C --> D["Exam and Question Authoring"]
    D --> E["Student Assignment"]
    E --> F["Exam Instructions and Start"]
    F --> G["Answer Autosave and Monitoring"]
    G --> H["Submission and Evaluation"]
    H --> I["Results and Reports"]

    C -.-> J[("Users / Institutes / Departments")]
    D -.-> K[("Exams / Questions / Question Banks")]
    E -.-> L[("Exam Assignments")]
    G -.-> M[("Attempts / Answers / Activity Logs")]
    H -.-> N[("Results / Coding Submissions")]
    I -.-> O[("Reports / Audit Logs")]
```

## 12. Data Store Catalogue

| ID | Data store | Main tables | Purpose |
|---|---|---|---|
| D1 | Identity data | `users`, `user_profiles` | Credentials, roles, profiles, and access state |
| D2 | Organization data | `institutes`, `departments`, `subjects` | Institute hierarchy and academic subjects |
| D3 | Exam authoring data | `exams`, `questions`, `question_types` | Exam metadata and question papers |
| D4 | Question bank data | `question_bank`, `question_bank_groups` | Reusable questions and saved groups |
| D5 | Assignment data | `exam_assignments` | Students assigned to exams |
| D6 | Attempt data | `exam_attempts`, `student_answers` | Timers, submissions, answers, and marks |
| D7 | Monitoring data | `exam_proctoring_settings`, `student_activity_logs` | Security configuration and activity events |
| D8 | Coding data | `coding_question_details`, `coding_submissions` | Coding constraints, source code, and execution results |
| D9 | Supporting data | `notifications`, `exam_sessions`, `file_uploads` | Messages, lab sessions, and uploaded files |
| D10 | Governance data | `institute_settings`, `audit_logs` | Configuration and administrative traceability |

## 13. API-to-Process Mapping

| API route group | DFD process |
|---|---|
| `/api/auth/*` | 1.0 Authenticate Users |
| `/api/institute` | 2.0 Manage Institute and Departments |
| `/api/institute/dashboard/*` | 2.0 and 7.0 Dashboard and Reporting |
| `/api/department` | 2.0 Manage Institute and Departments |
| `/api/department/dashboard/*` | 3.0, 7.0 Student Management and Monitoring |
| `/api/exams` | 4.0, 6.0, and 7.0 Exam Authoring, Delivery, and Reporting |
| `/api/question-banks` | 5.0 Manage Question Banks |
| `/api/student/dashboard` | 6.0 Deliver Exam and Process Answers |
| `/api/user` | 1.0 and 3.0 Authentication and User Profiles |
| `/api/run` | Coding Execution DFD |
