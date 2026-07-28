# ExamCraft – Online Exam Management System

ExamCraft is a full‑stack web application for managing online examinations in colleges and institutes. It supports a complete hierarchy of **Institute Admin → Department Admin/Teacher → Student**, with role‑based dashboards and a secure exam interface.

## Features

### Institute / Super Admin
- Create and manage **departments**
- Add **Department Head / Department Admin** accounts
- Centralized control over institute setup

### Department Admin / Teacher
- Add and manage **students** for their department
- Create and publish **online exams**
- Configure question sets, duration, and marks
- Monitor submissions and view basic results (extendable)

### Student
- **Login** to student portal
- View **Available Exams** dashboard
- Start / resume exams with:
  - Question navigation
  - Option selection and autosave in state
  - Live **countdown timer** and progress
- Submit exam and get redirected back to **Login**

## Tech Stack

- **Frontend:** React, Vite, React Router (HashRouter), Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Auth & Validation:** JWT, bcrypt, Joi  
- **Database:** MySQL (via `mysql2`) and SQL scripts (see `/SQL` folder)  
- **Other:** dotenv, CORS, REST APIs

> The repo is split into `/backend` and `/frontend` with independent Node projects.

---
```
## Project Structure
ExamCraftForked
├── backend # Node/Express API
│ ├── models # DB models / schema helpers
│ ├── routes # API route definitions
│ ├── node_modules # Backend dependencies
│ └── ... # config, server.js, etc.
│
├── frontend # React + Vite + Tailwind app
│ ├── public
│ ├── src
│ │ ├── assets
│ │ ├── components
│ │ │ ├── institute # Institute Admin views
│ │ │ ├── department # Dept Admin / Teacher views
│ │ │ ├── exam # Exam UI, AvailableExams, ExamDashboard
│ │ │ └── student
│ │ │ └── sidebar # Student navigation
│ │ └── global # shared layout, theme, utils
│ └── node_modules # Frontend dependencies
│
├── doc # Design docs, diagrams, PPT assets
└── SQL # Database schema and seed scripts
```


---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- MySQL server
- Git

### 1. Backend Setup

cd backend

install dependencies
npm install

configure environment
cp .env.example .env # if available

then update .env with DB credentials, JWT_SECRET, PORT, etc.
run backend server
npm run dev # or: npm start


Example `.env`:
PORT=3000
MYSQL_PORT=3306
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=examcraft
JWT_SECRET=default_secret


Import initial schema from `/SQL`:

-- In MySQL client / GUI
SOURCE path/to/SQL/your-schema.sql;

Note: to check docker mysql database use: docker exec -it examcraft-mysql mysql -u root -p
and password is "password"
### 2. Frontend Setup

cd frontend

install dependencies
npm install

run dev server
npm run dev


Typical URLs:

- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:5000/`

---

## Frontend Routing

Using **HashRouter**:

- `#/login` – Student login page  
- `#/exams` – Student Dashboard (Available Exams)  
- `#/exam/:examId` – Exam Dashboard (exam interface)  
- `#/institute-dashboard` – Institute Admin area  
- `#/department-dashboard` – Department Admin / Teacher area  

---

## Key Screens

- **Institute Dashboard**
  - Add Department
  - Add Department Head / Admin

- **Department / Teacher Dashboard**
  - Add Students
  - Create Exams (title, description, duration, questions)

- **Student Dashboard**
  - List of available and in‑progress exams
  - Start / Resume buttons

- **Exam Interface**
  - Question by question navigation
  - Option selection with visual state
  - Countdown timer and auto‑submit on timeout
  - On submit → redirect to `/login`

---

## High-Level API Design

> Adjust names to your actual route definitions.

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET  /api/departments`
- `POST /api/departments`
- `POST /api/departments/:id/students`
- `GET  /api/exams`
- `POST /api/exams`
- `GET  /api/exams/:examId`
- `POST /api/exams/:examId/submit`

Protected routes expect:

Authorization: Bearer <JWT_TOKEN>


---

## Architecture

- **Frontend (React + HashRouter)**  
  SPA with role-based dashboards and exam UI.

- **Backend (Node.js + Express)**  
  Handles authentication, exam logic, validation (Joi), and REST APIs.

- **Database (MySQL)**  
  Stores users, departments, exams, questions, and results. SQL definitions live in `/SQL`.

---

## NPM Scripts

### Backend (`/backend`)

npm run dev # Start dev server (nodemon)
npm start # Start production server
npm test # Backend tests (if configured)


### Frontend (`/frontend`)

npm run dev # Start Vite dev server
npm run build # Production build
npm run preview # Preview production build
npm run lint # Lint source code


---

## Future Enhancements

- Detailed analytics dashboard for teachers and admins
- Email / SMS notifications for exam schedules
- Advanced role‑based permission system
- Online proctoring features
- Question bank import/export

---






