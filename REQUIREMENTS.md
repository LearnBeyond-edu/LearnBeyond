# LearnBeyond System Requirements

To run the LearnBeyond platform locally or deploy it to production, your environment must meet the following hardware and software requirements.

## 🛠️ Software Prerequisites

### 1. Database Layer
- **PostgreSQL**: Version 15.0 or higher (v17 recommended).
- **Redis (Optional)**: Version 6+ for caching API responses and managing JWT blocklists in production.

### 2. Runtime & Package Managers
- **Node.js**: Version 18.17.0 or higher (LTS recommended). Next.js 15 requires a modern Node runtime.
- **npm**: Version 9+ (bundled with Node 18+).

### 3. Build Tools
- **Git**: For version control and deployment.
- **Python / C++ Build Tools**: Required by some native Node.js dependencies (e.g., `bcrypt`) on certain operating systems.

---

## 🔑 Environment Variables

The platform relies on `.env` files to keep sensitive information secure. You must define these files before starting the application.

### Backend (`/backend/.env`)
Create a `.env` file inside the `backend` folder containing the following properties:

```ini
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=learnbeyond_db

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# Uploads
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880 # 5MB

# AI API Keys (Used securely by the server)
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=AIza_your_gemini_key_here
```

### Frontend (`/frontend/.env.local`)
Create a `.env.local` file inside the `frontend` folder containing the AI keys. (Note: These are deliberately **NOT** prefixed with `NEXT_PUBLIC_` to ensure they remain secure Server Actions).

```ini
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=AIza_your_gemini_key_here
```

---

## 💻 Hardware Recommendations

**For Local Development:**
- **OS:** Windows 10/11, macOS, or Linux
- **RAM:** Minimum 8GB (16GB recommended due to running Next.js compiler, PostgreSQL, and Node backend simultaneously).
- **CPU:** Multi-core processor (e.g., Intel i5/i7, Apple M1/M2).

**For Production Deployment:**
- **Database:** Minimum 2GB RAM managed PostgreSQL instance (e.g., AWS RDS, Supabase, Neon).
- **Frontend Server:** Vercel (recommended) or minimum 1GB RAM Docker container.
- **Backend API:** Minimum 1GB RAM Node.js environment (e.g., AWS EC2, DigitalOcean App Platform, Render).
