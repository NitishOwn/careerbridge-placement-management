# CareerBridge — Placement & Recruitment Management System

CareerBridge is a full-stack placement and recruitment management platform that connects students with recruiters through a role-based web application.

## Features

### Student
- Student registration and login
- Browse available jobs
- Search jobs by title or company
- Apply for jobs
- Track application status

### Recruiter
- Recruiter registration and login
- Post new jobs
- View applicants
- Review applications
- Shortlist or reject candidates
- Update application status

## Tech Stack

### Frontend
- React.js
- Vite
- CSS

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JWT authentication
- Role-based authorization
- bcrypt password hashing
- Environment variables

## Application Flow

Student:
Register → Login → Browse Jobs → Apply → Track Application

Recruiter:
Register → Login → Post Job → View Applicants → Update Status

## Project Structure

```text
careerbridge-placement-management/
├── client/
│   ├── src/
│   ├── package.json
│   └── index.html
├── server.js
├── package.json
├── .env.example
└── README.md