import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/venue/dashboard" />} />
        <Route path="/venue/dashboard" element={<VenueOwnerDashboard />} />
        <Route path="/venue/listings" element={<VenueListingsPage />} />
        <Route path="/venue/create" element={<CreateVenuePage />} />
        <Route path="/venue/edit/:id" element={<EditVenuePage />} />
        <Route path="/venue/calendar/:id" element={<VenueCalendarPage />} />
        <Route path="/venue/bookings" element={<BookingRequestsPage />} />
        <Route path="/venue/layout" element={<LayoutDesignerPage />} />
        <Route path="/organizer/venues" element={<OrganizerVenueSearchPage />} />
        <Route path="/organizer/bookings/new" element={<OrganizerCreateBookingPage />} />
        <Route path="/organizer/bookings" element={<OrganizerBookingStatusPage />} />
      </Routes>
    </Router>
  );
}

export default App;