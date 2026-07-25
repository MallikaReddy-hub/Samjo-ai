# Samjho AI

**Idea2Impact 2026 · Theme: Education & Social Impact**

Samjho AI is a doubt-solving assistant for underserved and first-generation students. Instead of just answering a question, it diagnoses the *underlying concept gap* behind the doubt, explains it at the student's grade level, and generates quick practice questions to confirm the gap is closed — then tracks topic-wise mastery over time.

## Problem

Rural and first-generation students often can't afford tutoring, hesitate to ask "basic" doubts, and generic chatbots don't adapt explanations to their actual grade level or track whether the doubt was truly understood.

## How AI is used (core, not decorative)

1. Student submits a doubt by typing or **speaking** (Web Speech API), and picks an explanation language (English, Kannada, Telugu, Hindi, Tamil). Voice recognition listens in that language, and the AI responds in it too. The language choice is remembered for next time.
2. The doubt, grade level, and subject are sent to the Claude API.
3. The model diagnoses the specific concept gap, writes a grade-appropriate explanation, tags the topic, and generates 2 practice questions with answers.
4. Once a student answers all practice questions correctly, the session is marked resolved.
5. A dashboard aggregates all sessions per student into topic-wise mastery percentages, surfacing weak topics first.
6. If the explanation still doesn't click, the student can tap "I still didn't understand" to pull up relevant YouTube video explanations for that exact topic, grade, and subject.
7. **For Class 10 students:** a separate "Model Papers" tab lets students pick CBSE or Karnataka SSLC pattern and a subject, and the AI generates a full board-style model question paper (correct section structure, marks weightage, and an answer key) they can download. Note: these are original AI-generated practice papers modeled on the real exam pattern, not reproductions of actual copyrighted board papers.

## Tech Stack

- **Frontend:** React (Vite), plain CSS, Web Speech API
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Deployment:** Vercel (frontend) + Render (backend)

## Project Structure

```
samjho-ai/
├── backend/
│   ├── models/Session.js
│   ├── models/ModelPaper.js
│   ├── routes/doubtRoutes.js
│   ├── routes/dashboardRoutes.js
│   ├── routes/modelPaperRoutes.js
│   └── server.js
└── frontend/
    ├── src/components/DoubtForm.jsx
    ├── src/components/ResultCard.jsx
    ├── src/components/Dashboard.jsx
    ├── src/components/ModelPaperGenerator.jsx
    └── src/App.jsx
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and ANTHROPIC_API_KEY
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

## API Endpoints

| Method | Endpoint                        | Description                              |
|--------|----------------------------------|-------------------------------------------|
| POST   | `/api/doubts`                   | Submit a doubt, get AI diagnosis          |
| PATCH  | `/api/doubts/:id/resolve`       | Mark a session as resolved                |
| GET    | `/api/doubts/:studentName`      | Get a student's past sessions             |
| GET    | `/api/dashboard/:studentName`   | Get topic-wise mastery for a student      |
| POST   | `/api/modelpapers`              | Generate a Class 10 model question paper  |
| GET    | `/api/modelpapers/:studentName` | Get a student's past generated papers     |

## Live Demo

- Deployed link: _add after deployment_
- Demo video: _add after recording_

## Author

Mallika · B.Tech Information Science & Engineering, Presidency University
