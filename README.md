EduNexus

EduNexus is a full-stack Education Management and University Research & Startup Innovation platform that I developed to make academic and institutional management easier, more organized, and more accessible.

The project combines a modern React frontend, Express.js backend, and MySQL database. It includes authentication, role-based access control, user management, course management, email verification, notifications, and different workflows for Members, Mentors, Investors, Admins, and Founders.

I developed EduNexus as a practical full-stack project to improve my skills in React, Node.js, Express.js, MySQL, REST APIs, authentication, database design, and modern web application development.

Features
JWT-based Authentication & Authorization
Role-Based Access Control (RBAC)
Student/Member Management
Teacher/Mentor Management
Investor Management
Admin & Founder Management
Course Management
Email Verification with OTP
Password Reset
Notifications
Mentor/Investor Approval Workflow
Admin Approval Workflow
RESTful API
MySQL Database Integration
Responsive User Interface
Secure Password Hashing with bcrypt
Tech Stack
Frontend
React.js
Vite
Tailwind CSS
Axios
React Router
Backend
Node.js
Express.js
JWT
Nodemailer
bcrypt
mysql2
Database
MySQL 8+
Project Structure
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
Getting Started 

Follow the steps below to run EduNexus on your local machine.

Prerequisites

Make sure the following are installed:

Node.js 18+
npm
MySQL 8+
Git
VS Code (recommended)
1. Clone the Repository
git clone https://github.com/shahidurshakib/EduNexus.git
cd EduNexus
2. Setup MySQL Database

Create a database named edunexus_project:

CREATE DATABASE edunexus_project CHARACTER SET utf8mb4;

Then import the database files.

macOS / Linux / Git Bash
mysql -u root -p edunexus_project < database/schema.sql
mysql -u root -p edunexus_project < database/migration_phase2.sql
Windows PowerShell

PowerShell does not support the < redirect operator in the same way, so use:

Get-Content database/schema.sql | mysql -u root -p edunexus_project
Get-Content database/migration_phase2.sql | mysql -u root -p edunexus_project

If you are using XAMPP and mysql is not recognized, use the MySQL executable directly:

Get-Content database/schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root edunexus_project
3. Backend Setup

Open a terminal and go to the backend folder:

cd backend

Install the required packages:

npm install

Create the environment file:

macOS / Linux / Git Bash
cp .env.example .env
Windows PowerShell
Copy-Item .env.example .env

Open backend/.env and configure your settings:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edunexus_project

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
JWT Secret

Use long random strings for the JWT secrets.

You can generate them with:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Email Configuration

Email credentials are required for:

OTP verification
Password reset
Email notifications

For Gmail, EMAIL_PASS should be a Google App Password, not your normal Gmail password.

If email is not configured, the application can still run, but OTP emails will not be sent. During development, an account can be verified manually using:

UPDATE users
SET is_email_verified = 1
WHERE email = 'your-email@example.com';
Seed Demo Data

After configuring the database:

npm run seed

Then start the backend:

npm run dev

The backend API should be available at:

http://localhost:5000
4. Frontend Setup

Open another terminal.

cd frontend

Install dependencies:

npm install

Create the environment file.

macOS / Linux / Git Bash
cp .env.example .env
Windows PowerShell
Copy-Item .env.example .env

Make sure frontend/.env contains:

VITE_API_BASE_URL=http://localhost:5000/api

Important: The /api part must be included.

For example:

http://localhost:5000/api

not:

http://localhost:5000

Leaving out /api is one of the most common reasons for getting a 404 error during registration or login.

Start the frontend:

npm run dev

The frontend should now be available at:

http://localhost:5173
Demo Accounts

Running:

npm run seed

creates demo accounts for different roles.

All seeded accounts use:

Password: ChangeMe123!
Role	Email
Founder	founder@edunexus.local
Admin	admin@edunexus.local
Mentor	kamal.mentor@example.com
Investor	rafiul.investor@example.com
Member	nusrat@example.com

For security, change the default passwords after logging in.

Role & Approval Workflow

EduNexus uses different approval rules depending on the user's role.

Member

Members do not require administrative approval.

A user can register, verify their email, and become an active Member.

Mentor / Investor

Mentor and Investor roles can be requested during registration.

However, the account initially remains a Member until the request is approved by a Founder or Admin.

After approval:

The requested role becomes active.
The appropriate profile becomes available.
The user gets access to role-specific functionality.
Admin

Admin accounts cannot be directly created from the registration page.

An existing user can request Admin access, but the request must be approved by the Founder.

Founder

The Founder is the highest-level role in the system.

The Founder account is created through:

npm run seed

The Founder can approve:

Admin requests
Mentor requests
Investor requests
Production Build

To create a production build of the frontend:

cd frontend
npm run build

The production files will be generated inside:

frontend/dist

Possible deployment platforms include:

Vercel
Netlify
Render
Railway
VPS
MySQL hosting services

When deploying frontend and backend separately, update:

VITE_API_BASE_URL=https://your-backend-url.com/api

The URL must point to the actual deployed backend API.

Troubleshooting
404 Error During Registration or Login

Check the following:

1. Backend is running
cd backend
npm run dev

The backend should run on:

http://localhost:5000
2. Frontend is running
cd frontend
npm run dev

The frontend should run on:

http://localhost:5173
3. Check frontend .env

Make sure:

VITE_API_BASE_URL=http://localhost:5000/api

contains /api.

4. Check backend .env

Make sure the database credentials are correct:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edunexus_project

Also make sure schema.sql has been imported successfully.

White Screen After Login

If the dashboard shows a white screen:

Open the browser.
Press F12.
Open the Console tab.
Check the React error message.

A common reason is trying to render an object directly inside JSX.

Check the components inside:

frontend/src/pages/dashboards/

and make sure API objects are converted to appropriate strings, numbers, or UI components before rendering.

Email / SMTP Error

If you see an SMTP or email authentication error, check:

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

For Gmail, use a Google App Password instead of your normal Gmail password.

If email is not required during development, manually verify the account:

UPDATE users
SET is_email_verified = 1
WHERE email = 'your-email@example.com';
Project Highlights
Full-stack web application
React + Vite frontend
Express.js REST API
MySQL relational database 
JWT authentication
Role-Based Access Control
Secure password hashing
Email OTP verification
Approval-based role management
Responsive UI
Modular backend architecture
Scalable database structure
What I Learned From This Project

While developing EduNexus, I worked with different parts of a complete web application, including:

Designing a relational database
Building REST APIs
Connecting React with an Express backend
Implementing JWT authentication
Managing user roles and permissions
Working with MySQL
Handling environment variables
Implementing email verification
Creating approval workflows
Debugging frontend and backend issues
Preparing an application for deployment

This project helped me understand how the different parts of a full-stack application work together rather than treating frontend, backend, and database development as separate tasks.

Author

Shahidur Rahman Shakib

Computer Science and Engineering
Metropolitan University, Sylhet, Bangladesh

GitHub:
https://github.com/shahidurshakib

License

This project was developed by me for educational, academic, and research purposes.
