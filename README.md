# Secure Online Examination System (MERN)

Modern role-based online exam system using React (frontend), Node.js + Express (backend), and MongoDB Atlas.

## Project Structure

- frontend: React + Vite client
- backend: Express API with JWT auth and MongoDB models

## Features

- Roles: Admin and Student
- Authentication with JWT
- Exam management
- Question management
- Result management
- Anti-cheating event tracking

## Quick Start

1. Configure environment variables.

Backend (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/examdb?retryWrites=true&w=majority
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

2. Install dependencies.

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Run backend.

```bash
cd backend
npm run dev
```

4. Run frontend.

```bash
cd frontend
npm run dev
```

## API Endpoints (Core)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/exams`
- `POST /api/exams` (admin)
- `POST /api/exams/:id/questions` (admin)
- `POST /api/exams/:id/start` (student)
- `POST /api/exams/:id/answers` (student, save progress)
- `POST /api/exams/:id/submit` (student)
- `GET /api/results/me` (student)
- `GET /api/results/exam/:examId` (admin)
- `POST /api/anti-cheat/track` (student)
