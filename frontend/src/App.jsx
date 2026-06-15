import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VenueListingsPage from './pages/venue/VenueListingsPage';
import CreateVenuePage from './pages/venue/CreateVenuePage';
import EditVenuePage from './pages/venue/EditVenuePage';
import VenueCalendarPage from './pages/venue/VenueCalendarPage';
import BookingRequestsPage from './pages/venue/BookingRequestsPage';
import LayoutDesignerPage from './pages/venue/LayoutDesignerPage';
import VenueAnalyticsPage from './pages/venue/VenueAnalyticsPage';
import VenueOwnerDashboard from './pages/venue/VenueOwnerDashboard';
import VenueOwnerProfilePage from './pages/venue/VenueOwnerProfilePage';
import OrganizerVenueSearchPage from './pages/organizer/OrganizerVenueSearchPage';
import OrganizerCreateBookingPage from './pages/organizer/OrganizerCreateBookingPage';
import OrganizerBookingStatusPage from './pages/organizer/OrganizerBookingStatusPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';

// Redirects to the correct dashboard based on role, or /login if not authenticated
function RootRedirect() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Wait for localStorage to be read
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
  if (user.role === 'VENUE_OWNER') return <Navigate to="/venue/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route — smart redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

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
          <Route path="/venue/layout/:venueId" element={<LayoutDesignerPage />} />
          <Route path="/venue/layout" element={<LayoutDesignerPage />} />
          <Route path="/venue/analytics" element={<VenueAnalyticsPage />} />

          <Route path="/venue/profile" element={<VenueOwnerProfilePage />} />
          {/* --- ORGANIZER ROUTES --- */}
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/venues" element={<OrganizerVenueSearchPage />} />
          <Route path="/organizer/bookings/new" element={<OrganizerCreateBookingPage />} />
          <Route path="/organizer/bookings" element={<OrganizerBookingStatusPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;