# Placement Platform — Backend MVP

A learning project for a student/recruiter job board. Built with Node.js, Express, MongoDB and JWT authentication. **This is a backend starter, not a finished MERN app.**

## Setup
1. Install Node.js 20+ and start MongoDB locally (or use MongoDB Atlas).
2. `npm install`
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET` and `CLIENT_ORIGIN`.
4. `npm run dev`
5. Check `GET http://localhost:5000/api/health`.

## Routes
| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{name,email,password,role}` |
| POST | `/api/auth/login` | Public | `{email,password}` returns JWT |
| GET | `/api/jobs?q=&page=1` | Public | Search/paginate jobs |
| POST | `/api/jobs` | Recruiter | `{title,company,location,description}` |
| POST | `/api/jobs/:id/apply` | Student | Apply once |
| GET | `/api/applications/mine` | Student | Own applications |
| GET | `/api/jobs/:id/applications` | Job owner | View applicants |
| PATCH | `/api/applications/:id/status` | Job owner | `{status:"reviewing"}` etc. |

For protected routes send `Authorization: Bearer YOUR_TOKEN`.

## Before presenting as a finished resume project
Build and test a React frontend; add stronger request validation, automated tests, rate limiting, deployment, screenshots, and a clear architecture explanation. Do not commit `.env` or real credentials. Never claim features you haven't implemented.
