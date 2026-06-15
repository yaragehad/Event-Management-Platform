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

function RootRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
  if (user.role === 'VENUE_OWNER') return <Navigate to="/venue/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
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
          <Route path="/venue/dashboard" element={<ProtectedRoute><VenueOwnerDashboard /></ProtectedRoute>} />
          <Route path="/venue/listings" element={<ProtectedRoute><VenueListingsPage /></ProtectedRoute>} />
          <Route path="/venue/create" element={<ProtectedRoute><CreateVenuePage /></ProtectedRoute>} />
          <Route path="/venue/edit/:id" element={<ProtectedRoute><EditVenuePage /></ProtectedRoute>} />
          <Route path="/venue/calendar/:id" element={<ProtectedRoute><VenueCalendarPage /></ProtectedRoute>} />
          <Route path="/venue/bookings" element={<ProtectedRoute><BookingRequestsPage /></ProtectedRoute>} />
          <Route path="/organizer/layout/:venueId" element={<ProtectedRoute><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/organizer/layout" element={<ProtectedRoute><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/venue/analytics" element={<ProtectedRoute><VenueAnalyticsPage /></ProtectedRoute>} />
          <Route path="/venue/profile" element={<ProtectedRoute><VenueOwnerProfilePage /></ProtectedRoute>} />

          {/* --- ORGANIZER ROUTES --- */}
          <Route path="/organizer/dashboard" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/venues" element={<ProtectedRoute><OrganizerVenueSearchPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings/new" element={<ProtectedRoute><OrganizerCreateBookingPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings" element={<ProtectedRoute><OrganizerBookingStatusPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;