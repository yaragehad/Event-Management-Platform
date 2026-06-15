# Event-Management-Platform
Full-stack Event Management Platform built with React, Node.js, and DB for venue booking, event planning, vendor coordination, guest management, and staff operations.
# Event Management Platform

A full-stack web application for managing events end-to-end — from venue booking and vendor coordination to guest management and day-of operations.

Built with **React**, **Node.js**, and **DB**.

---

## Team Members

| Member | Role | Branch |
|--------|------|--------|
| Member 1 | Organizer Portal Lead — Auth, Events, Budget, Tasks | `feature/member1-organizer` |
| Member 2 | Venue Management Lead — Listings, Bookings, Layout Designer | `feature/member2-venues` |
| Member 3 | Vendor Portal & Database Lead — Vendors, Deliveries, Invoices, Seed Data | `feature/member3-vendors-db` |
| Member 4 | Guest Experience Lead — Guests, RSVP, Messaging | `feature/member4-guests` |
| Member 5 | Staff Portal & Integration Lead — Staff, Check-In, Docs | `feature/member5-staff-integration` |

---
## Detailed Roles

## Member 1 – Organizer Portal Lead

Responsible for:

GitHub repository setup
Authentication system
User roles and permissions
Organizer dashboard
Event creation and management
Venue search
Venue booking
Budget management
Task management

Features:

Login/Register
Role-based authentication
Organizer Dashboard
Event CRUD
Venue Search
Venue Booking Requests
Budget Tracking
Task Assignment
Task Tracking

Backend Responsibilities:

Authentication APIs
Organizer APIs
Event APIs
Budget APIs
Task APIs
Venue Search APIs

Frontend Responsibilities:

Organizer Dashboard
Event Pages
Budget Pages
Task Pages
Venue Search Pages


## Member 2 – Venue Management & Venue Owner Portal

Responsible for:

Venue Owner Portal
Venue listing management
Venue booking request management
Venue booking calendar
Venue availability management
Venue performance dashboard
Venue layout designer
Floor plan management
Drag-and-drop layout editor
Layout export functionality
Layout sharing with staff

Features:

Venue Owner Features:

Venue Owner Registration/Login
Create Venue Listings
Edit Venue Listings
Upload Venue Photos
Upload Floor Plans
Manage Availability Calendar
Approve Booking Requests
Reject Booking Requests
Booking History
Confirmed Bookings Dashboard
Venue Performance Dashboard
Revenue Reports

Venue Design Features:

Digital Floor Plan Viewer
Drag-and-Drop Layout Designer
Save Layout
Edit Layout
Export Layout as PDF/Image
Share Layout with Staff

Backend Responsibilities:

Venue APIs
Venue Listing CRUD
Booking Approval APIs
Calendar APIs
Layout APIs

Frontend Responsibilities:

Venue Owner Dashboard
Venue Listing Pages
Booking Management Pages
Calendar Views
Layout Designer Pages


## Member 3 – Vendor Portal & Database Lead

Responsible for:

Vendor portal
Sourcing requests
Delivery tracking
Invoice management
Database schema design
Database relationships
Dummy data generation
Seed scripts

Features:

Vendor Dashboard
Vendor Requests
Delivery Status Tracking
Invoice Submission
Database Models
Seed Data Scripts

Backend Responsibilities:

Vendor APIs
Delivery APIs
Invoice APIs
Database Design
Seed Scripts

Frontend Responsibilities:

Vendor Dashboard
Vendor Management Pages
Invoice Pages


## Member 4 – Guest Experience & Communication

Responsible for:

Guest portal
RSVP management
Invitations
Guest check-in system
Day-of operations dashboard
Messaging and notifications

Features:

Guest Dashboard
RSVP System
Invitations
Check-In Flow
Live Event Dashboard
Notifications
Messaging System

Backend Responsibilities:

Guest APIs
RSVP APIs
Messaging APIs

Frontend Responsibilities:

Guest Dashboard
RSVP Pages
Invitation Pages
Messaging Pages


## Member 5 – Staff Portal & Integration Lead

Responsible for:

Staff portal
Staff task management
Guest check-in support
Vendor arrival tracking
Frontend-backend integration
API testing
README documentation
Deployment documentation

Features:

Staff Dashboard
Task Tracking
Guest Check-In
Vendor Arrival Management
API Integration
Project Documentation

Backend Responsibilities:

Staff APIs
Integration Testing

Frontend Responsibilities:

Staff Dashboard
Staff Task Pages
Check-In Pages

---

## Technologies Used

| Layer | Technology |
|-------|------------|
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Version Control | GitHub |

---

## Project Structure

```
event-management-platform/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── .env
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   ├── package.json
│   └── .env
├── database/
│   └── seed.js
├── docs/
│   └── AI-chatlog.md
└── README.md
```

---

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yaragehad/event-management-platform.git
cd event-management-platform
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder by copying `.env.example`:

```bash
copy .env.example .env
```

Update `.env` values if needed:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_management_platform?schema=public"
PORT=3001
JWT_SECRET="change-me-in-dev"
```

Apply migrations and seed the database:

```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:3001`.

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder by copying `.env.example`:

```bash
copy .env.example .env
```

Set API URL:

```
REACT_APP_API_URL=http://localhost:3001/api
```

Start the frontend:

```bash
npm start
```

The frontend will run on `http://localhost:3000`.

---

### 4. Database Setup & Dummy Data

1. Make sure PostgreSQL is running.
2. Create a database named `event_management_platform`.
3. Confirm `DATABASE_URL` in `backend/.env` points to this database.
4. Run migrations and seed data:

```bash
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

If seeding fails because data already exists, reset and reseed:

```bash
npx prisma migrate reset
```

This will recreate the schema and run seed again.

## Implemented User Journeys

### Event Organizer
- [x] ...
- [x] ...

### Venue Owner
- [x] ...

### Vendor
- [x] ...
### Guest
- [x] ...
### Staff
- [x] ...
---

## Assumptions
...
---

## API Overview

to be updated

---


## Submission Checklist

- [x] Frontend implemented using React
- [x] Backend implemented using Node.js and Express
- [x] Frontend communicates with backend through API requests
- [x] Database created and populated with dummy data
- [x] Seed script included and documented
- [x] GitHub repository contains all project code and documentation
- [x] Each team member has at least one meaningful commit
- [x] README includes setup, run instructions, and assumptions
- [x] AI chatlog included in `docs/`
- [ ] Submitted before Thursday, 18 June 2026
