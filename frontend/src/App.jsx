<<<<<<< HEAD
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InvitationPage from './pages/InvitationPage'
import RSVPPage from './pages/RSVPPage'
import DayOfMessagesPage from './pages/DayOfMessagesPage'
import CheckInPage from './pages/CheckInPage'
import FeedbackPage from './pages/FeedbackPage'
import DayOfDashboardPage from './pages/DayOfDashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/invitation/:eventId" element={<InvitationPage />} />
        <Route path="/rsvp/:eventId" element={<RSVPPage />} />
        <Route path="/messages/:eventId" element={<DayOfMessagesPage />} />
        <Route path="/checkin/:eventId" element={<CheckInPage />} />
        <Route path="/feedback/:eventId" element={<FeedbackPage />} />
        <Route path="/dashboard/:eventId" element={<DayOfDashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VenueListingsPage from './pages/venue/VenueListingsPage';
import CreateVenuePage from './pages/venue/CreateVenuePage';
import EditVenuePage from './pages/venue/EditVenuePage';
import VenueCalendarPage from './pages/venue/VenueCalendarPage';
import BookingRequestsPage from './pages/venue/BookingRequestsPage';
import LayoutDesignerPage from './pages/venue/LayoutDesignerPage';
import VenueOwnerDashboard from './pages/venue/VenueOwnerDashboard';
import OrganizerVenueSearchPage from './pages/organizer/OrganizerVenueSearchPage';
import OrganizerCreateBookingPage from './pages/organizer/OrganizerCreateBookingPage';
import OrganizerBookingStatusPage from './pages/organizer/OrganizerBookingStatusPage';


function App() {
  return (
    // 3. Wrap the entire Router in the AuthProvider
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* --- AUTHENTICATION ROUTES --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- VENUE OWNER ROUTES --- */}
          <Route path="/venue/dashboard" element={<VenueOwnerDashboard />} />
          <Route path="/venue/listings" element={<VenueListingsPage />} />
          <Route path="/venue/create" element={<CreateVenuePage />} />
          <Route path="/venue/edit/:id" element={<EditVenuePage />} />
          <Route path="/venue/calendar/:id" element={<VenueCalendarPage />} />
          <Route path="/venue/bookings" element={<BookingRequestsPage />} />
          <Route path="/venue/layout" element={<LayoutDesignerPage />} />

          {/* --- ORGANIZER ROUTES --- */}
          <Route path="/organizer/venues" element={<OrganizerVenueSearchPage />} />
          <Route path="/organizer/bookings/new" element={<OrganizerCreateBookingPage />} />
          <Route path="/organizer/bookings" element={<OrganizerBookingStatusPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
>>>>>>> origin/dev
