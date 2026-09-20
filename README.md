# AI-Powered Personalized Learning Path Recommender

A full-stack MERN application that delivers personalized learning experiences using Google Gemini AI.

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **AI** | Google Gemini 2.0 Flash (`@google/genai`) |
| **State** | Zustand with persistence |
| **Charts** | Recharts |

## Features

- 💬 **Conversational AI** — Natural language goal setting with Gemini
- 🧠 **Learner Profiling** — Interests, skills, experience, learning style
- 🗺️ **Personalized Roadmap** — Phase-by-phase path with real courses & projects
- 💡 **AI Explainability** — "Why this?" for every recommendation
- 📊 **Progress Dashboard** — Skill radar chart, phase progress bars, next actions
- 🎯 **Progress Tracking** — Mark resources complete, rate them, see streak

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

npm run dev    # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

### 3. Open the app

Visit **http://localhost:5173** — enter your name and start chatting!

## Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learning_recommender
GEMINI_API_KEY=your_key_here
```

## Project Structure

```
miniproject/
├── backend/
│   ├── server.js            # Express entry point
│   ├── models/
│   │   ├── User.js          # Learner profile schema
│   │   └── LearningPath.js  # Roadmap schema
│   ├── routes/
│   │   ├── auth.js          # Login
│   │   ├── profile.js       # Profile CRUD
│   │   ├── chat.js          # AI chat
│   │   ├── roadmap.js       # Roadmap generation & progress
│   │   └── courses.js       # Course catalog
│   ├── services/
│   │   └── geminiService.js # Gemini AI integration
│   └── data/
│       └── courses.js       # 50+ courses, 12+ domains
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.tsx   # Hero + login
        │   ├── ChatPage.tsx      # AI conversation
        │   ├── ProfilePage.tsx   # Profile editor
        │   ├── RoadmapPage.tsx   # Learning path
        │   └── DashboardPage.tsx # Stats & progress
        ├── components/
        │   ├── Navbar.tsx
        │   ├── MessageBubble.tsx
        │   ├── ResourceCard.tsx
        │   ├── SkillRadar.tsx
        │   └── ProgressRing.tsx
        ├── store/useStore.ts     # Zustand global state
        └── api/client.ts        # Axios API client
```

## How to Use

1. **Enter your name** on the landing page
2. **Chat with LearnAI** — describe your goal (e.g., "I want to become a data scientist")
3. Say **"Generate my roadmap"** or click the quick action
4. Navigate to the **Roadmap** tab to explore your personalized path
5. Click **"Why this?"** on any resource for AI explanation
6. **Check off resources** as you complete them
7. Visit the **Dashboard** to track your progress visually

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login / create account |
| GET | `/api/profile/:userId` | Get learner profile |
| PUT | `/api/profile/:userId` | Update profile |
| POST | `/api/chat` | Chat with Gemini AI |
| POST | `/api/roadmap/generate` | Generate personalized roadmap |
| GET | `/api/roadmap/:userId` | Get saved roadmap |
| PUT | `/api/roadmap/:userId/progress` | Mark resource complete |
| POST | `/api/roadmap/:userId/feedback` | Rate a resource |
| POST | `/api/roadmap/explain` | Explain a recommendation |
| GET | `/api/courses` | Browse course catalog |
