# EduNexus
### Education Management, University Research & Startup Innovation Platform

EduNexus is a full-stack Education Management and University Research & Startup Innovation Platform developed by **Shahidur Rahman Shakib**. The platform aims to simplify academic and institutional management while creating an organized digital ecosystem for students, mentors, investors, administrators, and startup founders.

Built with React.js, Node.js, Express.js, and MySQL, EduNexus provides a centralized environment for managing academic activities, user accounts, courses, research-related collaboration, and startup innovation workflows.

The project was developed as a practical full-stack application to strengthen expertise in modern web technologies, backend architecture, database management, authentication, API development, and scalable application design.

---

## Key Features

- JWT-Based Authentication and Authorization
- Role-Based Access Control (RBAC)
- Student and Member Management
- Teacher and Mentor Management
- Investor Management
- Admin and Founder Management
- Course Management
- Email Verification with OTP
- Password Reset Functionality
- Notification Management
- Mentor and Investor Approval Workflow
- Administrative Approval System
- RESTful API Architecture
- MySQL Database Integration
- Secure Password Hashing with bcrypt
- Responsive User Interface

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- JSON Web Token (JWT)
- Nodemailer
- bcrypt
- mysql2

### Database
- MySQL 8+

## Project Structure

```text
EduNexus/
│
├── database/
│   ├── schema.sql
│   └── migration_phase2.sql
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   │
│   ├── scripts/
│   │   └── seed.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# Getting Started

Follow the instructions below to configure and run EduNexus on your local development environment.

## Prerequisites

Make sure the following software is installed:

- Node.js 18+
- npm
- MySQL 8+
- Git
- Visual Studio Code (Recommended)

## 1. Clone the Repository

```bash
git clone https://github.com/shahidurshakib/EduNexus.git
cd EduNexus
```

## 2. Database Configuration

Create a MySQL database named `edunexus_project`.

```sql
CREATE DATABASE edunexus_project
CHARACTER SET utf8mb4;
```

Import the database files.

**macOS / Linux / Git Bash**

```bash
mysql -u root -p edunexus_project < database/schema.sql
mysql -u root -p edunexus_project < database/migration_phase2.sql
```

**Windows PowerShell**

```powershell
Get-Content database/schema.sql | mysql -u root -p edunexus_project

Get-Content database/migration_phase2.sql | mysql -u root -p edunexus_project
```

**For XAMPP users**

If MySQL is not recognized as a command, use the MySQL executable directly:

```powershell
Get-Content database/schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root edunexus_project
```

Repeat the command for the migration file.

## 3. Backend Configuration

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create your environment configuration file.

**macOS / Linux / Git Bash**

```bash
cp .env.example .env
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure the following environment variables:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edunexus_project

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### JWT Secret Configuration

Use strong, randomly generated values for your JWT secrets.

You can generate secure random strings using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate separate values for the access and refresh token secrets.

### Email Configuration

Email credentials are required for:

- OTP-based email verification
- Password reset
- Email notifications

For Gmail integration, use a Google App Password instead of your regular Gmail account password.

If email functionality is not configured, email-based verification and notifications will not work.

### Initialize Demo Data

After configuring the database, execute:

```bash
npm run seed
```

This command initializes the available demo data and role-based accounts.

### Start the Backend Server

```bash
npm run dev
```

The backend API should be accessible at:

```text
http://localhost:5000
```

## 4. Frontend Configuration

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Create the frontend environment file.

**macOS / Linux / Git Bash**

```bash
cp .env.example .env
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

Configure `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Important:** The `/api` suffix must be included in the API base URL.

Correct:

```text
http://localhost:5000/api
```

Incorrect:

```text
http://localhost:5000
```

An incorrect API base URL may cause 404 errors during registration, authentication, and other API operations.

### Start the Frontend

```bash
npm run dev
```

The frontend should now be accessible at:

```text
http://localhost:5173
```

---

## Demo Accounts

Running the seed command:

```bash
npm run seed
```

creates demo accounts for different user roles.

| Role | Email |
|---|---|
| Founder | founder@edunexus.local |
| Admin | admin@edunexus.local |
| Mentor | kamal.mentor@example.com |
| Investor | rafiul.investor@example.com |
| Member | nusrat@example.com |

Demo account credentials, if configured by the seed script, should be obtained from the development setup rather than published in this documentation.

For security, change any default credentials before using the application outside a local development environment.

---

## Role-Based Access & Approval Workflow

EduNexus implements a role-based account management system with different approval requirements.

### Member

- Members do not require administrative approval.
- Users can register and verify their email addresses.
- Once verification is completed, they can access Member functionality.

### Mentor / Investor

- Users can request Mentor or Investor roles during registration.
- Requested roles remain pending until approved by an authorized Founder or Admin.
- Following approval, the requested role becomes active.
- Approved users gain access to their respective role-specific functionality.

### Admin

- Admin accounts cannot be created directly through the public registration page.
- Existing users may request administrative access.
- Admin role requests require Founder approval.

### Founder

The Founder represents the highest-level administrative role in the platform.

The Founder account is initialized through the seed process:

```bash
npm run seed
```

The Founder has authority to approve:

- Admin requests
- Mentor requests
- Investor requests

---

## Production Build & Deployment

To generate an optimized production build of the frontend, navigate to the frontend directory:

```bash
cd frontend
npm run build
```

The generated production files will be available in:

```text
frontend/dist
```

### Supported Deployment Options

Potential deployment environments include:

- Vercel
- Netlify
- Render
- Railway
- Virtual Private Server (VPS)
- MySQL-Compatible Hosting Services

When deploying the frontend and backend separately, configure the frontend environment variable with your actual production API URL:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

Make sure the URL points to the deployed backend API.

**Production Security Recommendations**

- Use HTTPS for all production connections.
- Never expose database credentials or JWT secrets.
- Store sensitive configuration in environment variables.
- Use strong, unique authentication secrets.
- Restrict database access to trusted services.
- Configure appropriate CORS policies.
- Change all development and seed credentials.
- Never commit `.env` files or private credentials to GitHub.

---

## Troubleshooting

### 1. 404 Error During Registration or Login

Check the following configurations:

**Backend Server**

```bash
cd backend
npm run dev
```

Expected URL:

```text
http://localhost:5000
```

**Frontend Server**

```bash
cd frontend
npm run dev
```

Expected URL:

```text
http://localhost:5173
```

**Frontend Environment Configuration**

Verify that `frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend Environment Configuration**

Verify that the database connection details are correct:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edunexus_project
```

Also, ensure that the database schema and migration files have been imported successfully.

### 2. White Screen After Login

If the dashboard displays a blank screen:

1. Open your browser.
2. Press `F12`.
3. Navigate to the Console tab.
4. Review the reported React errors.
5. Inspect the relevant dashboard components.

Check the following directory:

```text
frontend/src/pages/dashboards/
```

A common cause is attempting to render a JavaScript object directly inside JSX. Convert API response objects into appropriate strings, numbers, or UI components before rendering them.

### 3. Email / SMTP Authentication Error

Verify the following environment variables:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

For Gmail, use a valid Google App Password rather than your regular account password.

If email services are not configured, OTP verification and email notifications will not function.

For local development only, an email can be manually marked as verified through the database, if the application supports this workflow:

```sql
UPDATE users
SET is_email_verified = 1
WHERE email = 'your-email@example.com';
```

---

## Project Highlights

- Full-Stack Web Application Architecture
- Modern React + Vite Frontend
- Express.js RESTful Backend
- MySQL Relational Database
- JWT-Based Authentication
- Role-Based Access Control
- Secure Password Hashing
- Email OTP Verification
- Approval-Based Role Management
- Responsive User Interface
- Modular Backend Architecture
- Structured Database Design
- Academic and Institutional Management Workflows

## What I Learned

Developing EduNexus provided practical experience in designing, developing, and integrating different components of a full-stack web application.

Throughout this project, I gained hands-on experience in:

- Relational database design and management
- RESTful API development
- React and Express.js integration
- JWT-based authentication and authorization
- Role and permission management
- MySQL database integration
- Environment variable configuration
- Email verification and OTP implementation
- Administrative approval workflows
- Frontend and backend debugging
- Application deployment preparation
- Modular and maintainable application architecture

This project strengthened my understanding of how frontend interfaces, backend services, authentication systems, and relational databases work together to build a complete web application.

---

## Author

**Shahidur Rahman Shakib**

Computer Science and Engineering  
Metropolitan University  
Sylhet, Bangladesh

**GitHub:**  
https://github.com/shahidurshakib

---

## License

Copyright © 2026 Shahidur Rahman Shakib. All Rights Reserved.

EduNexus is an independently developed project created for educational, academic, research, and technological development purposes.

Unless otherwise stated, the source code, architecture, design, documentation, and associated project materials are the intellectual property of the author.

Permission is granted to access, study, and reference this project for personal, educational, and non-commercial research purposes, provided that appropriate credit is given to the original author.

No part of this project may be commercially exploited, redistributed, republished, modified, or reproduced without prior written permission from the author, except where otherwise permitted by applicable law.

This project is provided for educational and research purposes. No warranty is expressed or implied regarding its functionality, reliability, or suitability for any particular purpose.

For licensing inquiries, commercial use, or permission requests, please contact the author.

**Author:** Shahidur Rahman Shakib  
**Project:** EduNexus  
**Copyright:** © 2026 Shahidur Rahman Shakib. All Rights Reserved.
