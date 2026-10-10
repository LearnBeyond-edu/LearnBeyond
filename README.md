**LearnBeyond — Learning Beyond Boundaries**

An AI-powered personalized educational ecosystem connecting students, teachers, parents, and therapists.

<p align="center">
  <strong>Personalized learning. Connected care. Meaningful progress.</strong>
</p><p align="center">
  <a href="https://learnbeyond.netlify.app/">Live Demo</a> ·
  <a href="https://github.com/LearnBeyond-edu/LearnBeyond">Source Code</a> ·
  <a href="https://github.com/LearnBeyond-edu/LearnBeyond/issues">Report an Issue</a>
</p>---

The Problem

Every learner is different, yet education often follows a one-size-fits-all approach.

Students may struggle to receive individualized support, teachers lack a unified view of learner progress, parents find it difficult to stay involved, and therapists need better ways to coordinate developmental support with educational goals.

These disconnected experiences make it harder to provide the right support at the right time.

Our Solution

LearnBeyond is an AI-powered educational platform designed to bring learning, progress tracking, family engagement, and therapeutic support into one connected ecosystem.

Instead of treating academic learning and developmental support as separate journeys, LearnBeyond provides dedicated portals for each stakeholder, helping them collaborate around the learner's progress.

At its core, LearnBeyond aims to make education more personalized, inclusive, and connected.

What Makes LearnBeyond Different?

- One connected ecosystem: Brings students, teachers, parents, and therapists together through role-specific experiences.
- AI-assisted workflows: Uses LAURA to support educational content creation, clinical documentation, and learning recommendations.
- Individualized support: Connects learning activities and progress insights with the learner's broader support journey.
- Collaborative progress tracking: Helps stakeholders understand academic activities and coordinate appropriate support.
- Learning beyond conventional classrooms: Designed to support diverse learning needs and more inclusive educational experiences.

Key Features

1. Student Portal

A learner-focused environment designed to make learning more engaging and accessible.

- Personalized learning dashboard.
- Gamified learning experiences.
- Interactive quizzes and learning activities.
- Academic progress visibility.
- Support alerts and access to teletherapy workflows.

2. Teacher Command Center

Tools to help educators manage learning activities and monitor student progress.

- Assignment creation and management.
- Quiz grading and academic tracking.
- Class-level progress monitoring.
- AI-assisted feedback and documentation workflows.

3. Parent Dashboard

A dedicated space for families to stay informed and involved.

- Visibility into academic performance.
- Completed lesson and activity tracking.
- Access to relevant progress information.
- Improved coordination with educators and support professionals.

4. Clinical Therapist Portal

A dedicated workspace for coordinating educationally relevant therapeutic support.

- Teletherapy session scheduling.
- Live video-session workflows.
- Individualized Education Program (IEP) progress documentation.
- Access to relevant learner-development information.
- Collaboration with the broader learner-support ecosystem.

Clinical information should be accessed only by appropriately authorized users. LearnBeyond is an educational support platform, not a replacement for professional clinical judgment.

5. LAURA — AI Learning Assistant

LAURA is LearnBeyond's integrated AI assistant, designed to support the platform's educational and documentation workflows.

Depending on the configured workflow, LAURA supports:

- AI-assisted assignment generation.
- Clinical note drafting.
- Learning recommendations.
- Context-aware assistance for educational tasks.

AI is intended to assist human decision-making, not replace teachers, parents, or qualified therapists. Generated content should be reviewed before it is used for consequential educational or clinical decisions.

---

Learning Approach

LearnBeyond is built around the idea that meaningful education should adapt to learners rather than forcing every learner into the same process.

The platform's learning vision draws on VAKT — Visual, Auditory, Kinesthetic, and Tactile learning approaches — to inform more varied learning experiences.

- Visual: Support learning through visual representations and explanations.
- Auditory: Incorporate listening and verbal explanation where available.
- Kinesthetic: Encourage learning through interaction and activity.
- Tactile: Explore hands-on learning experiences where appropriate.

These approaches are intended to broaden how learning can be experienced, not to label learners permanently or assume that one learning style alone determines how someone learns best.

---

How It Works

flowchart TD
    A[Learner] --> B[Student Portal]
    B --> C[Learning Activities]
    C --> D[Progress Information]

    D --> E[Teacher Portal]
    D --> F[Parent Portal]
    D --> G[Therapist Portal]

    H[LAURA AI] --> I[AI-Assisted Workflows]
    I --> E
    I --> G

    E --> J[Coordinated Learner Support]
    F --> J
    G --> J

The platform brings role-specific workflows together so that educational activities, progress information, and support processes can contribute to a more coordinated learning experience.

The diagram represents the intended high-level workflow; individual integrations and permissions depend on the implemented configuration.

---

Technology Stack

Layer| Technologies
Frontend| Next.js 15, React 19
Styling| Tailwind CSS
State management| Zustand
Data fetching| React Query, Axios
Animations| Framer Motion
Backend| Node.js, Express.js
Database| PostgreSQL
Authentication| JWT and role-based access control
AI integrations| Groq/Llama 3 and Google Gemini
Architecture| MVC, service and repository layers

Architecture Overview

LearnBeyond separates the user interface from backend services and data storage.

- Frontend: Presents role-specific dashboards and reusable interface components.
- Backend API: Handles application requests and coordinates business logic.
- Services and repositories: Organize application operations and data access.
- PostgreSQL: Stores application data according to the configured schema.
- AI integrations: Connect supported workflows to external language models.

This separation is intended to make the application easier to maintain, extend, and evaluate.

---

Getting Started

Follow these instructions to run LearnBeyond locally.

Prerequisites

Install the following before starting:

- Node.js 18 or later, with a compatible npm version.
- PostgreSQL 17 or a compatible configured PostgreSQL instance.
- Git.
- API credentials for the AI providers used by your selected workflows.

Review ""REQUIREMENTS.md"" (REQUIREMENTS.md) for the project's configuration requirements before proceeding.

1. Clone the Repository

git clone https://github.com/LearnBeyond-edu/LearnBeyond.git
cd LearnBeyond

2. Configure the Database

Create a PostgreSQL database and configure the connection settings required by the backend.

SQL setup files are available in the repository:

- ""database_schema.sql"" (database_schema.sql)
- ""database_setup.sql"" (database_setup.sql)
- ""neon_schema_full.sql"" (neon_schema_full.sql)

Review the contents of these files and use the schema and setup instructions appropriate to your configuration. Do not blindly apply multiple overlapping schema files to the same database.

3. Configure Environment Variables

Check "REQUIREMENTS.md" and the frontend/backend configuration files to identify the exact environment variables required by your checkout.

Create the appropriate local environment files and supply your own database credentials and AI provider keys.

Never commit API keys, database passwords, JWT secrets, or other credentials to Git.

4. Start the Backend

Open a terminal:

cd backend
npm install
npm run dev

5. Start the Frontend

Open another terminal from the repository root:

cd frontend
npm install
npm run dev

6. Open the Application

Open the local address printed by the frontend development server.

If the backend, database, and required integrations are configured correctly, you can begin exploring the application.

«Note: The commands above follow the existing repository documentation. Environment variables, database initialization, provider credentials, and local port configuration may require additional setup. Consult the project requirements and package scripts if startup fails.»

---

Repository Structure

LearnBeyond/
├── frontend/
│   ├── app/                 # Application routes and dashboards
│   ├── components/          # Reusable UI and interface components
│   └── services/            # Client-side API and AI integrations
│
├── backend/
│   └── src/                 # Server-side application code
│                              # Controllers, services and repositories
│
├── database_schema.sql      # Database schema
├── database_setup.sql       # Database setup SQL
├── neon_schema_full.sql     # Additional database schema
├── REQUIREMENTS.md          # Setup and configuration requirements
├── netlify.toml             # Netlify configuration
└── README.md                # Project documentation

This is a high-level map of the repository. Refer to the actual source folders for the complete implementation and current file organization.

---

Responsible AI, Privacy, and Security

Educational and clinical-support applications require particular care because their data may be sensitive.

LearnBeyond's development priorities include:

- Role-based access: Restrict access according to the user's assigned role and permissions.
- Credential protection: Keep provider API keys and database credentials out of client-facing code and version control.
- Human oversight: Require appropriate review of AI-generated educational and clinical content.
- Data minimization: Collect and expose only the information needed for each workflow.
- Privacy-aware design: Protect learner information and restrict sensitive records to authorized users.
- Transparent limitations: Distinguish AI-assisted suggestions from verified facts and professional assessments.

These are design and implementation priorities, not a claim of independently audited security or regulatory certification. Deployment teams should verify access controls, data handling, and applicable legal requirements before using real learner or clinical data.

---

Future Roadmap

The following are potential areas for continued development, subject to implementation and validation.

- [ ] Expand personalized learning pathways.
- [ ] Improve accessibility and inclusive interface design.
- [ ] Extend learning progress analytics and educator insights.
- [ ] Strengthen coordination between families, educators, and therapists.
- [ ] Evaluate AI-generated recommendations for quality, safety, and usefulness.
- [ ] Improve automated testing and deployment reliability.
- [ ] Validate privacy, security, and role-based access controls.
- [ ] Explore richer interactive learning activities.

---

Who Can Benefit?

Students — More engaging learning experiences and clearer progress visibility.

Teachers — Better-organized learning activities and support for classroom workflows.

Parents and families — A more connected view of academic progress and support activities.

Therapists — Dedicated workflows for coordinating sessions and documenting relevant progress.

Educational institutions — A platform concept for connecting learning management and multidisciplinary support.

---

Contributing

Contributions, feedback, and thoughtful feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them locally.
4. Commit your work with a descriptive message.
5. Open a pull request describing the problem, solution, and testing performed.

For bugs or suggestions, use the "GitHub Issues page" (https://github.com/LearnBeyond-edu/LearnBeyond/issues).

Please do not include real student records, private clinical information, credentials, or other sensitive data in issues or pull requests.

---

License

Please check the repository for a "LICENSE" file before reusing, modifying, or redistributing this project. If no license is provided, the code should not be assumed to be available for unrestricted reuse.

---

Our Vision

We believe education should go beyond delivering lessons.

It should help learners grow, give educators better tools, keep families involved, and make collaboration with support professionals easier.

LearnBeyond brings these experiences together around one shared purpose: helping every learner move forward.

<p align="center">
  <strong>LearnBeyond — Because every learner deserves a path beyond limitations.</strong>
</p>