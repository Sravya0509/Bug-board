# BugBoard — Mini Issue Tracking Platform

**BugBoard** is a clean, simple, and professional issue-tracking platform designed for teams to organize projects, report bugs, assign work to team members, track progress across workflow stages, and view personal tasks.

---

## 1. Project Overview

BugBoard provides engineering teams with an intuitive, unified workspace:
- **Single Administrator Workspace:** Exactly one administrator account is configured. All team members use this login to access BugBoard, eliminating the need to create and manage separate user accounts.
- **Team Tasks / Assignee View:** Team members can select or search their name to view all issues assigned specifically to them.
- **Workflow & Severity Tracking:** Full lifecycle tracking using 7 clear workflow statuses and 4 priority levels.

---

## 2. Main Features

- **Authentication & Single Administrator Policy:**
  - Secure login using JWT (JSON Web Tokens) and bcrypt password hashing.
  - Exactly one administrator account exists in the database.
  - Normal registration is automatically disabled once the administrator account is configured.
  - Team members share the workspace login to collaborate.

- **Real-Time Database Dashboard:**
  - Live statistics: **Total Projects**, **Total Issues**, and status distributions.
  - **Issues Grouped by Status:** Real-time counts for all 7 workflow states:
    - `Yet to Start`
    - `In Progress`
    - `In Review`
    - `Yet to Merge`
    - `Completed`
    - `Incompleted`
    - `Query`
  - **Issues Grouped by Priority:** Counts for `Low`, `Medium`, `High`, and `Critical`.
  - **Recently Updated Issues:** Table of latest issue updates, linked to details.

- **Project Management:**
  - Create, view, edit, and delete software projects.
  - Live issue count tracking per project.

- **Issue Management:**
  - Create issues with Title, Project selection, Description, Assignee Name, Priority, and Status.
  - Edit issue details, reassign to another team member, and update status.
  - Status updates and deletions update timestamps (`updated_at`).

- **Team Tasks / Assignee View:**
  - Dedicated view where any team member can select their name from a dropdown or type their name to inspect all tasks assigned to them.
  - Displays summary metrics (Total Assigned, In Progress, Completed, Pending Review/Start).
  - Works seamlessly without requiring individual account registration.

- **Search & Multi-Filter System:**
  - Search issues by title, description, or assignee name.
  - Filter simultaneously by **Project**, **Assignee**, **Status**, and **Priority**.

- **Comments & Activity:**
  - Threaded discussion on each issue with author name and timestamp.

---

## 3. Technologies Used

- **Frontend:** React (Vite, Functional Components, Hooks: `useState`, `useEffect`)
- **Backend:** Node.js + Express.js
- **Database:** MySQL 8.0
- **Communication:** REST APIs (JSON)
- **Styling:** Vanilla CSS (Modern, clean, responsive design system with badge indicators)

---

## 4. Complete Project Folder Structure

The project root contains exactly three main folders, `.gitignore`, and the root `README.md`:

```text
BugBoard/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── assignees.controller.js# Assignees CRUD and deletion protection
│   │   ├── auth.controller.js     # User authentication and admin policy
│   │   ├── dashboard.controller.js# Grouped status/priority counts & recent issues
│   │   ├── issues.controller.js   # CRUD operations, assignees, and filters
│   │   ├── projects.controller.js # Project CRUD operations
│   │   └── users.controller.js    # User management
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT token verification
│   ├── routes/
│   │   ├── assignees.routes.js    # /api/assignees routes
│   │   ├── auth.routes.js         # /api/auth routes
│   │   ├── dashboard.routes.js    # /api/dashboard routes
│   │   ├── issues.routes.js       # /api/issues routes
│   │   ├── projects.routes.js     # /api/projects routes
│   │   └── users.routes.js        # /api/users routes
│   ├── .env                       # Local environment variables (ignored by Git)
│   ├── .env.example               # Template environment variables
│   ├── package.json               # Backend dependencies and scripts
│   └── server.js                  # Express application entry point
├── database/
│   └── schema.sql                 # MySQL schema and single administrator setup
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx          # Reusable status and priority badges
│   │   │   ├── Navbar.jsx         # Top navigation bar with workspace profile
│   │   │   └── Sidebar.jsx        # Sidebar navigation and workspace guide
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # React authentication context provider
│   │   ├── pages/
│   │   │   ├── Assignees.jsx      # Assignees management (create/edit/delete/view)
│   │   │   ├── Dashboard.jsx      # Live database dashboard metrics
│   │   │   ├── IssueDetails.jsx   # Detailed issue view, reassign, status & comments
│   │   │   ├── Issues.jsx         # Issue list, search, multi-filters & modal
│   │   │   ├── Login.jsx          # Single administrator workspace login
│   │   │   ├── Projects.jsx       # Project listing and management modal
│   │   │   ├── Register.jsx       # Setup / registration restriction page
│   │   │   └── TeamTasks.jsx      # Team Tasks / Assignee View
│   │   ├── api.js                 # Centralized REST API client
│   │   ├── App.jsx                # Router, protected routes, and layout
│   │   ├── index.css              # Clean, professional CSS design system
│   │   └── main.jsx               # React DOM root entry
│   ├── index.html                 # Main HTML template
│   ├── package.json               # Frontend dependencies and scripts
│   └── vite.config.js             # Vite configuration
├── .gitignore                     # Git ignore rules protecting credentials & backups
└── README.md                      # Complete project documentation
```

---

## 5. Prerequisites

Make sure the following are installed on your system:

1. **Node.js** (v18 or higher recommended; v20+ supported) — Verify: `node -v`
2. **npm** (v9 or higher) — Verify: `npm -v`
3. **MySQL Server** (v8.0 or higher) — Verify: `mysql --version`

---

## 6. How to Create the MySQL Database

Open your terminal or MySQL command-line client and run:

```sql
CREATE DATABASE IF NOT EXISTS bugboard_db;
```

---

## 7. How to Execute the SQL Schema

Import the schema located in `database/schema.sql`:

### On Windows (Command Prompt / PowerShell):
```bash
# Using cmd (enter your MySQL password when prompted):
cmd /c "mysql -u root -p < database\schema.sql"

# Or from MySQL interactive shell:
mysql -u root -p
mysql> source d:/Bug-board/database/schema.sql;
```

This will automatically:
1. Create `bugboard_db` if not present.
2. Create the tables: `users`, `projects`, `issues`, and `comments`.
3. Set up the single administrator account (`admin@bugboard.com`).

---

## 8. How to Configure Backend Environment Variables

In `backend/`, copy `.env.example` to `.env`:

```bash
cd backend
copy .env.example .env
```

Configure your `.env` file with your local MySQL credentials:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bugboard_db
DB_PORT=3306

PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

*(Note: Real credentials are saved only in `backend/.env` on your local computer and are excluded by `.gitignore` so they are never committed to GitHub.)*

---

## 9. How to Install Backend Dependencies

Navigate to `backend/` and install packages:

```bash
cd backend
npm install
```

---

## 10. How to Start the Backend Server

Inside `backend/`, run:

```bash
npm start
```
*Or with hot reload:*
```bash
npm run dev
```

Output:
```text
🚀 BugBoard backend server is running on http://localhost:5000
✅ Connected to MySQL database successfully!
```

---

## 11. How to Install Frontend Dependencies

In a separate terminal, navigate to `frontend/` and run:

```bash
cd frontend
npm install
```

---

## 12. How to Start the React Frontend

Inside `frontend/`, run:

```bash
npm run dev
```

Output:
```text
  VITE v8.x ready in 300 ms

  ➜  Local:   http://localhost:3000/
```

---

## 13. Application URLs

- **Frontend Application:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:5000/api`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

---

## 14. REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate with administrator credentials | Public |
| POST | `/api/auth/register` | Initial setup (disabled once admin exists) | Public |
| GET | `/api/auth/status` | Check if administrator is already configured | Public |
| GET | `/api/auth/me` | Fetch active user profile | Authenticated |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard` | Grouped status/priority counts & recent issues | Authenticated |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/projects` | List all projects with issue count | Authenticated |
| GET | `/api/projects/:id` | Get project details and child issues | Authenticated |
| POST | `/api/projects` | Create a new project | Authenticated |
| PUT | `/api/projects/:id` | Update project details | Authenticated |
| DELETE | `/api/projects/:id` | Delete a project | Authenticated |

### Assignees (`/api/assignees`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/assignees` | List all assignees with assigned task counts | Authenticated |
| GET | `/api/assignees/:id` | Get assignee details with active issues | Authenticated |
| POST | `/api/assignees` | Create new assignee (duplicate name checks) | Authenticated |
| PUT | `/api/assignees/:id` | Update assignee name (syncs with issues) | Authenticated |
| DELETE | `/api/assignees/:id` | Delete assignee (blocked if issues assigned) | Authenticated |

### Issues (`/api/issues`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/issues` | List issues (search, status, priority, project, assignee) | Authenticated |
| GET | `/api/issues/assignees`| Distinct assigned team member list | Authenticated |
| GET | `/api/issues/:id` | Single issue details and timestamps | Authenticated |
| POST | `/api/issues` | Report a new issue | Authenticated |
| PUT | `/api/issues/:id` | Update issue details | Authenticated |
| PATCH | `/api/issues/:id/reassign`| Reassign issue to another team member | Authenticated |
| PATCH | `/api/issues/:id/status`| Update issue status | Authenticated |
| DELETE | `/api/issues/:id` | Delete an issue | Authenticated |
| GET | `/api/issues/:id/comments` | List issue comments | Authenticated |
| POST | `/api/issues/:id/comments` | Post a comment on an issue | Authenticated |

---

## 15. Database Tables & Architecture

```text
[users] (1) ──────────< (many) [projects] (created_by -> users.id)
   │
   ├─────────< (many) [issues] (created_by -> users.id)
   └─────────< (many) [comments] (user_id -> users.id)

[assignees] (1) ──────< (many) [issues] (assignee_id -> assignees.id ON DELETE RESTRICT)
[projects] (1) ───────< (many) [issues] (project_id -> projects.id ON DELETE CASCADE)
[issues] (1) ─────────< (many) [comments] (issue_id -> issues.id ON DELETE CASCADE)
```

1. **`users` Table (Single Administrator):**
   - `id` (INT PK, Auto Increment)
   - `name` (VARCHAR(100))
   - `email` (VARCHAR(150), Unique)
   - `password` (VARCHAR(255), bcrypt hash)
   - `role` (ENUM: 'Admin')
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`projects` Table:**
   - `id` (INT PK, Auto Increment)
   - `name` (VARCHAR(150))
   - `description` (TEXT)
   - `created_by` (INT FK -> `users.id`)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **`assignees` Table:**
   - `id` (INT PK, Auto Increment)
   - `name` (VARCHAR(150), Unique)
   - `created_at`, `updated_at` (TIMESTAMP)

4. **`issues` Table:**
   - `id` (INT PK, Auto Increment)
   - `title` (VARCHAR(200))
   - `description` (TEXT)
   - `project_id` (INT FK -> `projects.id` ON DELETE CASCADE)
   - `assignee_id` (INT FK -> `assignees.id` ON DELETE RESTRICT)
   - `assignee_name` (VARCHAR(150), team member name)
   - `priority` (ENUM: 'Low', 'Medium', 'High', 'Critical')
   - `status` (ENUM: 'Yet to Start', 'In Progress', 'In Review', 'Yet to Merge', 'Completed', 'Incompleted', 'Query')
   - `created_by` (INT FK -> `users.id` ON DELETE CASCADE)
   - `created_at`, `updated_at` (TIMESTAMP)

5. **`comments` Table:**
   - `id` (INT PK, Auto Increment)
   - `issue_id` (INT FK -> `issues.id` ON DELETE CASCADE)
   - `user_id` (INT FK -> `users.id` ON DELETE CASCADE)
   - `comment_text` (TEXT)
   - `created_at` (TIMESTAMP)

---

## 16. How to Log In

1. Open `http://localhost:3000` in your web browser.
2. Sign in using the administrator credentials:
   - **Email:** `admin@bugboard.com`
   - **Password:** `password123`
   *(Or click the **Autofill Administrator** button for one-click testing).*
3. All team members use this login. To inspect your assigned tasks, navigate to the **Team Tasks** tab and pick or enter your name.

---

## 17. Common Troubleshooting

1. **"Access denied for user 'root'@'localhost'"**
   - Ensure `DB_PASSWORD` in `backend/.env` matches your MySQL server password.

2. **"Unknown database 'bugboard_db'"**
   - Execute the schema file: `cmd /c "mysql -u root -p < database\schema.sql"`.

3. **"Failed to fetch on frontend"**
   - Ensure the Express backend is running on `http://localhost:5000` (`curl http://localhost:5000/api/health`).

---

## License

This project is built for educational and demonstration purposes. Clean, simple, and fully open-source.
