# 🚀 LearnBeyond Educational Platform

<div align="center">
  <h3>An Enterprise-Grade, AI-Powered Learning Ecosystem</h3>
  <p>LearnBeyond is a comprehensive, full-stack educational platform that unifies academic tracking, clinical teletherapy, and AI-driven insights into specialized, role-based portals.</p>
</div>

---

## ✨ Key Features

LearnBeyond replaces fragmented educational tools by providing specialized dashboards for every stakeholder in a student's journey:

- 🧑‍🎓 **Student Portal**: Gamified learning dashboard, clinical support alerts, interactive quizzes, and seamless entry into live teletherapy sessions.
- 👨‍🏫 **Teacher Command Center**: Manage assignments, grade quizzes, track class progress, and generate AI-assisted clinical feedback.
- 👨‍👩‍👧 **Parent Dashboard**: Real-time insights into child academic performance, completed lessons, and direct visibility into multidisciplinary therapy notes.
- 🩺 **Clinical Therapist Portal**: Schedule secure teletherapy sessions, conduct live video meetings, log clinical IEP progress, and review student neuro-developmental metrics.
- 🤖 **Laura AI Assistant**: Integrated context-aware AI running on Groq/Llama-3 and Google Gemini for generating assignments, clinical notes, and learning recommendations.

## 💻 Tech Stack

**Frontend (Client)**
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS + custom Google Stitch design system UI
- **State Management:** Zustand
- **Data Fetching:** React Query & Axios
- **Animations:** Framer Motion

**Backend (Server)**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL (v17)
- **Authentication:** JWT (JSON Web Tokens) with strict RBAC middleware
- **Architecture:** Enterprise MVC pattern with abstracted Repositories and Services

## 📂 Project Structure

```text
LearnBeyond/
├── frontend/           # Next.js 15 UI Application
│   ├── app/            # App Router (Role-based dashboards)
│   ├── components/     # Reusable UI components & Teletherapy rooms
│   └── services/       # Client-side API and AI integrations
├── backend/            # Node.js Express API Server
│   ├── src/            # MVC architecture (Controllers, Services, Repositories)
│   └── .env            # Backend Secrets & Database config
├── README.md
└── run_learnbeyond.bat # 1-Click Windows Dev Launcher
```

## 🚀 Getting Started

Please see the `REQUIREMENTS.md` file for system prerequisites and required environment variables before starting.

### 1-Click Windows Start
If you are on Windows and have PostgreSQL running, you can launch the entire stack (Frontend + Backend) simultaneously:
1. Double-click `run_learnbeyond.bat` in the root folder.
2. The script will verify your database, start the Node.js backend on Port `5000`, start the Next.js frontend on Port `4005`, and open your browser automatically.

### Manual Start
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Security & Deployment
This project is configured for secure deployment. Client-side Next.js environment variables have been scrubbed of raw API keys in favor of **Next.js Server Actions**, ensuring that Groq/Gemini LLM keys never leak to the browser.
