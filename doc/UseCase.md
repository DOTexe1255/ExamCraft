# ExamCraft Use Case Diagram

## System Overview

ExamCraft is an online examination management system used by institute administrators, department administrators or teachers, and students.

## Actors

### Institute Administrator

- Authenticate user
- Register and manage institute
- Manage departments
- Create department administrators
- View institute dashboard
- View activity logs
- Generate institute reports
- Configure institute settings

### Department Administrator / Teacher

- Authenticate user
- Manage students
- Update student access
- Create and schedule exams
- Edit exam details
- Create question banks
- Add MCQ questions
- Add descriptive questions
- Add coding questions
- Assign students to exams
- Monitor live examinations
- Force-submit an attempt
- View exam reports

### Student

- Authenticate user
- View available exams
- View exam instructions
- Start an exam
- Answer questions
- Save answers
- Navigate questions
- Submit an exam
- View exam status and results
- Submit coding solutions

## Use Case Diagram

```mermaid
flowchart LR
    IA[Institute Admin]
    DA[Department Admin / Teacher]
    ST[Student]

    subgraph ExamCraft[ExamCraft Online Examination System]
        UC1((Authenticate User))
        UC2((Register Institute))
        UC3((Manage Departments))
        UC4((Manage Department Admins))
        UC5((Manage Students))
        UC6((Create and Schedule Exam))
        UC7((Edit Exam))
        UC8((Manage Question Bank))
        UC9((Add MCQ Questions))
        UC10((Add Descriptive Questions))
        UC11((Add Coding Questions))
        UC12((Assign Students))
        UC13((View Exam Instructions))
        UC14((Start Exam))
        UC15((Answer Questions))
        UC16((Save Answers))
        UC17((Submit Exam))
        UC18((Calculate Results))
        UC19((View Exam Status and Results))
        UC20((Submit Coding Solution))
        UC21((Monitor Live Exam))
        UC22((Force Submit Attempt))
        UC23((Generate Reports))
        UC24((View Audit Activity))
        UC25((Configure Institute Settings))
    end

    IA --> UC1
    IA --> UC2
    IA --> UC3
    IA --> UC4
    IA --> UC23
    IA --> UC24
    IA --> UC25

    DA --> UC1
    DA --> UC5
    DA --> UC6
    DA --> UC7
    DA --> UC8
    DA --> UC12
    DA --> UC21
    DA --> UC22
    DA --> UC23

    ST --> UC1
    ST --> UC13
    ST --> UC14
    ST --> UC15
    ST --> UC16
    ST --> UC17
    ST --> UC19
    ST --> UC20

    UC6 -. includes .-> UC8
    UC8 -. extends .-> UC9
    UC8 -. extends .-> UC10
    UC8 -. extends .-> UC11
    UC14 -. includes .-> UC13
    UC15 -. includes .-> UC16
    UC17 -. includes .-> UC18
    UC20 -. includes .-> UC18
```

## Use Case Relationships

- Authentication is required before accessing protected features.
- Creating an exam includes selecting or creating its question content.
- A question bank can contain MCQ, descriptive, and coding questions.
- Starting an exam includes viewing exam instructions.
- Answering questions includes saving answers.
- Submitting an exam includes result calculation.
- Coding submissions are evaluated as part of result processing.
- Department administrators can monitor active attempts and force-submit them when required.
- Institute administrators and department teachers can generate reports according to their authorization scope.
