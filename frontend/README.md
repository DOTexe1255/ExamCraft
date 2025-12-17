# ExamCraft — Frontend (Vite + React)

Lightweight frontend prototype for the ExamCraft project, built with Vite and React. This folder contains the UI used by students and teachers to interact with the ExamCraft prototype.

## Quick Overview

- **Framework:** React (Vite)
- **Purpose:** Prototype student/teacher dashboards and client-side integration with the prototype API/database.

## Prerequisites

- Node.js 18+ and npm (or an equivalent package manager)
- Basic Git knowledge to clone the repository

## Quickstart (local development)

1. From the repository root, change into the frontend folder:

	cd frontend

2. Install dependencies:

	npm install

3. Start the dev server with HMR:

	npm run dev

4. Open the app at the address shown in the terminal (usually http://localhost:5173).

## Available scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run preview` — locally preview the production build
- `npm run lint` — run ESLint

These scripts are defined in `package.json` in this folder.

## Project structure (important files)

- `index.html` — app entry HTML
- `src/main.jsx` — application bootstrap
- `src/App.jsx` — top-level app component
- `src/components/Index.jsx` — main entry component
- `src/components/StudentDashboard.jsx` — student view
- `src/components/TeacherDashboard.jsx` — teacher view
- `src/global/MyContext.jsx` — shared React context
- `src/assets/` — static assets
- `public/` — static public files

Database: see the SQL schema at `SQL/Examcraft_db_proto.sql` in the repository root for the prototype DB schema used by the backend.

## Environment / Configuration

This prototype expects a backend API. If the frontend requires environment variables, add them to a `.env` file here (example):

- `VITE_API_BASE_URL` — base URL for the prototype API (e.g., http://localhost:4000)

Vite exposes env vars prefixed with `VITE_` to the client.

## Contributing

- Make changes on a branch, open a pull request, and include a short description of your changes.
- For UI changes, include screenshots or a short description of how to test.

## Notes

- This is a prototype; authentication, production hardening, and tests are minimal or intentionally omitted.

If you want, I can also:

- add a minimal `.env.example` for `VITE_API_BASE_URL`
- add more detailed setup steps for connecting to the prototype backend
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
