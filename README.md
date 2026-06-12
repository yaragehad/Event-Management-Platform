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

## Technologies Used

| Layer | Technology |
|-------|------------|
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | to be decided |
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
- ....
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

Create a `.env` file inside the `backend/` folder:

```

JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:5000`.

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

The frontend will run on `http://localhost:3000`.

---

### 4. Database Setup & Dummy Data

to be updated

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
