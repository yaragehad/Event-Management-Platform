# Event-Management-Platform
Full-stack Event Management Platform built with React, Node.js, and DB for venue booking, event planning, vendor coordination, guest management, and staff operations.
# Event Management Platform

A full-stack web application for managing events end-to-end — from venue booking and vendor coordination to guest management and day-of operations.

Built with **React**, **Node.js**, and **MongoDB**.

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
| Database | MongoDB, Mongoose |
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
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
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
MONGO_URI=mongodb://localhost:27017/event-platform
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

Make sure MongoDB is running, then from the root of the project:

```bash
cd database
npm install
node seed.js
```

This will populate the database with generated dummy data including:

- 25 users across all roles (organizer, venue owner, vendor, staff, guest)
- 10 events
- 8 venue listings
- 15 booking requests
- 30 tasks
- 20 guests with RSVP records
- 10 vendor sourcing requests
- 10 invoices
- 15 messages

To reset the database and re-seed:

```bash
node seed.js
```

> The seed script clears all collections before inserting fresh data.

---

## Implemented User Journeys

### Event Organizer
- [x] Register and log in
- [x] Create, view, and manage events
- [x] Search and browse venue listings
- [x] Submit venue booking requests and track their status
- [x] Create and manage budget (planned vs. actual)
- [x] Create and assign tasks to staff members
- [x] View vendor list and submit sourcing requests
- [x] View guest list, send invitations, and track RSVP status
- [x] Access day-of operations dashboard

### Venue Owner
- [x] Register and log in
- [x] Create and manage venue listings
- [x] Upload photos and set availability
- [x] Approve or decline booking requests
- [x] View confirmed bookings calendar

### Vendor
- [x] Log in and view profile
- [x] View and respond to sourcing requests
- [x] Update delivery status
- [x] Submit invoices for completed deliveries

### Guest
- [x] View digital invitation and event details
- [x] Submit RSVP response with dietary preferences
- [x] Receive and view day-of messages

### Staff
- [x] Log in with organizer-provided credentials
- [x] View assigned tasks and update their status
- [x] Access guest list and update check-in status
- [x] Mark vendors as arrived

---

## Assumptions

The following assumptions were made where the User Journeys document did not specify full implementation details:

- Email delivery is simulated — invitations and notifications are stored in the database and displayed in-app, not sent via real email.
- QR code check-in is implemented as a name/ID lookup rather than actual QR code scanning.
- The venue layout designer saves element positions as JSON in the database; drag-and-drop is implemented using a simple grid system.
- Vendor registration can be done independently or via organizer-created credentials.
- All monetary values are stored and displayed in EGP (Egyptian Pounds) as the platform is scoped for Egypt-based events.
- Post-event feedback is collected through a simple form; no external survey tool is used.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create a new event |
| GET | `/api/venues` | Browse venue listings |
| POST | `/api/bookings` | Submit a booking request |
| PUT | `/api/bookings/:id/status` | Approve or decline a booking |
| GET | `/api/vendors` | Get vendor list |
| POST | `/api/vendors/requests` | Submit a sourcing request |
| PUT | `/api/deliveries/:id/status` | Update delivery status |
| POST | `/api/invoices` | Submit an invoice |
| GET | `/api/guests` | Get guests for an event |
| POST | `/api/rsvp` | Submit an RSVP |
| PUT | `/api/guests/:id/checkin` | Check in a guest |
| GET | `/api/tasks` | Get tasks for an event |
| PUT | `/api/tasks/:id` | Update task status |
| GET | `/api/messages` | Get messages for an event |
| POST | `/api/messages` | Send a message |

---


## Submission Checklist

- [x] Frontend implemented using React
- [x] Backend implemented using Node.js and Express
- [x] Frontend communicates with backend through API requests
- [x] MongoDB database created and populated with dummy data
- [x] Seed script included and documented
- [x] GitHub repository contains all project code and documentation
- [x] Each team member has at least one meaningful commit
- [x] README includes setup, run instructions, and assumptions
- [x] AI chatlog included in `docs/`
- [ ] Submitted before Thursday, 18 June 2026
