# Student Portal - Full-Stack Web Application

A full-stack, role-based Student Portal web application designed for **Teachers** to manage courses, post assignments, and grade student deliverables, and for **Students** to track deadlines, submit work with file attachments, and view grades and teacher feedback.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control
- **Dual User Roles**: `TEACHER` and `STUDENT`.
- **Secure Password Hashing**: Utilizes `bcryptjs` with salt rounds = 10.
- **JWT Authentication**: JSON Web Tokens with configurable expiration (`7d`).
- **Role Guards**: Backend route middleware (`requireRole('TEACHER')`, `requireRole('STUDENT')`) and frontend protected route guards (`<ProtectedRoute allowedRoles={['TEACHER']}>`).
- **Quick Demo Logins**: One-click demo account filling for instant evaluation.

### 2. Teacher Features
- **Faculty Dashboard**: Real-time metrics (Classes, Students, Assignments, Pending Submissions).
- **Pending Submissions to Grade**: Direct queue of submitted student tasks awaiting evaluation.
- **Course & Roster Management**: Create, edit, and delete courses; manage student rosters; enroll students by email.
- **Assignment Creation**: Publish assignments with custom due dates, point totals, and instructions.
- **Grading & Feedback Modal**: Input numeric scores (0 to max points) and written feedback.
- **Class Gradebook Matrix**: Master grid view of all students × all assignments with calculated earned points and class averages.

### 3. Student Features
- **Student Dashboard**: Upcoming deadlines sorted by due date with dynamic status tags (`Pending`, `Submitted`, `Graded`, `Overdue`), along with recent grades.
- **Course Catalog & Enrollment**: View enrolled courses and browse/self-enroll into available courses with one click.
- **Assignment Details & Deliverable Submission**: Comprehensive instructions, points, and deadline countdown. Supports rich text answers and/or document/code/archive file uploads via Multer.
- **Edit Submissions**: Students can update answers or replace file attachments anytime prior to the deadline.
- **Grades & Feedback View**: Detailed score breakdowns, percentage calculations, and teacher evaluation notes.

### 4. Shared Features
- **Profile Management**: View and edit name, email, and update password with current password verification.
- **Responsive Navigation**: Collapsible sidebar navigation, role indicator badges, and top navbar.
- **Validation & Error Handling**: Comprehensive Zod schemas and React Hook Form validation on all client and server inputs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, TanStack Query v5, Zustand, React Hook Form, Zod, Lucide React icons.
- **Backend**: Node.js, Express REST API, CORS, Dotenv.
- **Database & ORM**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`).
- **File Uploads**: Multer local storage under `/server/uploads` with storage abstraction layer ready for AWS S3 / Cloudinary.
- **Security**: JWT (`jsonwebtoken`) and password hashing (`bcryptjs`).

---

## 📁 Repository Structure

```
student-portal/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptors
│   │   ├── components/         # Layout, Sidebar, Navbar, Modal, Badge, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Signup pages
│   │   │   ├── teacher/        # Dashboard, Classes, ClassDetail, AssignmentDetail, Gradebook
│   │   │   ├── student/        # Dashboard, Classes, Assignment, Grades
│   │   │   ├── Profile.jsx     # User profile management
│   │   │   └── NotFound.jsx    # 404 page
│   │   ├── store/              # Zustand auth state store
│   │   ├── App.jsx             # Router and React Query provider
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Node.js Express REST API
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (PostgreSQL provider)
│   ├── src/
│   │   ├── controllers/        # Auth, Class, Assignment, Submission, Dashboard
│   │   ├── middleware/         # Auth JWT, Role authorization, Multer file upload
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # Hash & JWT utilities
│   │   ├── db.js               # Database service with Prisma and resilient dev fallback
│   │   └── index.js            # Express server entry point
│   ├── uploads/                # Local storage for student file deliverables
│   ├── .env.example
│   ├── .env
│   └── package.json
├── package.json                # Monorepo root scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v24.x tested)
- **npm**: v9 or higher

### 2. Install Dependencies
From the root directory:
```bash
# Install all dependencies across monorepo
npm run install:all
```
Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Variables Configuration
In `server/.env`:
```env
# Server Port
PORT=5000

# PostgreSQL Connection String (replace with your local or cloud Postgres e.g. Neon, Supabase)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_portal?schema=public"

# JWT Secret & Expiration
JWT_SECRET="student_portal_jwt_secret_dev_key_2026"
JWT_EXPIRES_IN="7d"

# Allowed Frontend Origin for CORS
CLIENT_URL="http://localhost:5173"

# Uploads directory
UPLOAD_DIR="uploads"
```

### 4. Database Setup & Prisma
The Prisma schema is pre-configured with the complete relational schema:
```bash
cd server

# Generate Prisma Client
npx prisma generate

# When connecting to your PostgreSQL instance, apply migrations:
npx prisma migrate dev --name init
```

> **Note on Zero-Config Local Dev Mode:**
> If a local PostgreSQL instance is not actively running on port 5432, the backend automatically operates with an in-memory dev database with pre-seeded demo accounts and courses so you can test all features immediately without any setup hurdles.

### 5. Running the Application
Start both the backend server and frontend client:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Alternatively, from the project root:
```bash
npm run server   # starts Express on :5000
npm run client   # starts Vite on :5173
```

---

## 🔑 Demo Accounts

Use these pre-configured accounts or register new accounts directly in the UI:

| Role | Email | Password | Details |
|---|---|---|---|
| **Teacher** | `teacher@portal.edu` | `password123` | Prof. Sarah Connor (CS101, WEB200) |
| **Student** | `student@portal.edu` | `password123` | Alex Mercer (Enrolled in CS101, WEB200) |
| **Student** | `elena@portal.edu` | `password123` | Elena Vance (Enrolled in CS101) |

*You can also click the quick demo buttons on the Login page to autofill these credentials with a single click.*

---

## 🧪 Automated Testing

An end-to-end integration test suite is included in `server/src/test-api.js`:
```bash
cd server
node src/test-api.js
```
This executes **23 automated tests** covering:
1. Health checks
2. Teacher & student authentication and JWT token verification
3. Role-based forbidden checks (students blocked from faculty endpoints)
4. Class creation, listing, and student enrollment
5. Assignment creation and deadline tracking
6. Student submissions (text and Multer file upload)
7. Teacher grading and written feedback updates
8. Gradebook matrix calculation and student grade summaries
9. Aggregated dashboard metrics for both roles
