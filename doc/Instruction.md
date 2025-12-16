# Exam Craft — Setup & Instructions

## Stack Overview
- Frontend: React + Vite, React Router for role-based routing (/admin, /department, /student), Axios for API calls, Context API or Zustand for auth state.
- Backend: Node.js + Express, MySQL (mysql2), JWT for auth, CORS enabled for React origin.
- Tools: Nodemon (dev), concurrently (run both servers), dotenv for config, bcryptjs for passwords, Postman/Cypress/Jest for testing.

---

## Project Structure
Recommended root layout:
```
examcraft/
├── frontend/     # React app
└── backend/      # Node/Express API
```

---

## Step 1 — Backend Setup
1. Create project and install deps:
```bash
cd backend
npm init -y
npm i express mysql2 cors dotenv jsonwebtoken bcryptjs
npm i -D nodemon
```
2. Minimal server (server.js):
```js
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes example:
// app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
```

---

## Step 2 — Frontend Setup
1. Create Vite React app and install libs:
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm i react-router-dom axios zustand
```
2. Run dev:
```bash
npm run dev  # Vite default: http://localhost:5173
```

---

## Step 3 — Database & Auth
- MySQL tables: users (id, email, password_hash, role: 'admin'|'department'|'student'), exams, questions, results, student_exam_attempts, etc.
- Backend /routes/auth.js responsibilities:
  - Verify password with bcryptjs
  - Sign JWT containing { userId, role }
  - Return token to client
- Frontend login flow:
  - POST to /api/auth/login
  - Store token (HttpOnly cookie recommended or secure storage)
  - Decode/derive role and redirect to role dashboard

---

## Role-Based Routing (Frontend)
Use a ProtectedRoute guard to enforce roles:
```jsx
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from './useAuth'; // auth hook or Zustand store

const ProtectedRoute = ({ role, children }) => {
  const { userRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return userRole === role ? children : <Navigate to="/login" />;
};
export default ProtectedRoute;
```
Example routes:
```jsx
// App.jsx
<Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminLayout/></ProtectedRoute>} />
<Route path="/department/*" element={<ProtectedRoute role="department"><DeptLayout/></ProtectedRoute>} />
<Route path="/student/*" element={<ProtectedRoute role="student"><StudentLayout/></ProtectedRoute>} />
```

---

## Exam Flow & Secure Browser
- Student exam screen: Timer component, question navigation, local state with autosave to /api/exams/:id/answers (every 10s).
- Backend checks:
  - Valid JWT
  - Safe Exam Browser (SEB) validation — verify HTTP_USER_AGENT contains "SEB" (or other configured marker) before allowing exam start.
- SEB config disables copy/paste, right-click, dev tools, external tabs.

---

## Dev Scripts / Running Both Servers
Add a root-level dev script to run both servers concurrently:
```json
// package.json (root)
{
  "scripts": {
    "dev": "concurrently \"cd backend && nodemon server.js\" \"cd frontend && npm run dev\""
  }
}
```
Install concurrently globally if preferred:
```bash
npm i -g concurrently
```

---

## Next Immediate Steps (recommended)
1. Backend: configure MySQL connection, create `users` table, implement login endpoint and JWT middleware.
2. Frontend: implement basic routing and login form that calls backend.
3. Create minimal seed data for testing (one admin, one department, a student).
4. Prepare SEB test config for lab exam launches.

---

This file contains all original instructions; formatted and organized for clarity.

