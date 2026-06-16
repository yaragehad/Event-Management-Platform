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
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTaskList from './pages/staff/StaffTaskList';
import StaffFloorPlan from './pages/staff/StaffFloorPlan';
import GuestCheckIn from './pages/staff/GuestCheckIn';
import VendorArrival from './pages/staff/VendorArrival';
import DayOfDashboard from './pages/staff/DayOfDashboard';
import GuestDetails from './pages/staff/GuestDetails';

function RootRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
  if (user.role === 'VENUE_OWNER') return <Navigate to="/venue/dashboard" replace />;
  if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* --- AUTHENTICATION ROUTES --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- VENUE OWNER ROUTES --- */}
          <Route path="/venue/dashboard" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueOwnerDashboard /></ProtectedRoute>} />
          <Route path="/venue/listings" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueListingsPage /></ProtectedRoute>} />
          <Route path="/venue/create" element={<ProtectedRoute allowedRole="VENUE_OWNER"><CreateVenuePage /></ProtectedRoute>} />
          <Route path="/venue/edit/:id" element={<ProtectedRoute allowedRole="VENUE_OWNER"><EditVenuePage /></ProtectedRoute>} />
          <Route path="/venue/calendar/:id" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueCalendarPage /></ProtectedRoute>} />
          <Route path="/venue/bookings" element={<ProtectedRoute allowedRole="VENUE_OWNER"><BookingRequestsPage /></ProtectedRoute>} />
          <Route path="/venue/layout" element={<ProtectedRoute allowedRole="VENUE_OWNER"><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/venue/analytics" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueAnalyticsPage /></ProtectedRoute>} />
          <Route path="/venue/profile" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueOwnerProfilePage /></ProtectedRoute>} />

          {/* --- ORGANIZER ROUTES --- */}
          <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/venues" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerVenueSearchPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings/new" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerCreateBookingPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerBookingStatusPage /></ProtectedRoute>} />
          <Route path="/organizer/layout/:venueId" element={<ProtectedRoute allowedRole="ORGANIZER"><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/organizer/layout" element={<ProtectedRoute allowedRole="ORGANIZER"><LayoutDesignerPage /></ProtectedRoute>} />

          {/* --- STAFF ROUTES --- */}
          <Route path="/staff/dashboard" element={<ProtectedRoute allowedRole="STAFF"><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/tasks" element={<ProtectedRoute allowedRole="STAFF"><StaffTaskList /></ProtectedRoute>} />
          <Route path="/staff/floorplan" element={<ProtectedRoute allowedRole="STAFF"><StaffFloorPlan /></ProtectedRoute>} />
          <Route path="/staff/checkin" element={<ProtectedRoute allowedRole="STAFF"><GuestCheckIn /></ProtectedRoute>} />
          <Route path="/staff/vendors" element={<ProtectedRoute allowedRole="STAFF"><VendorArrival /></ProtectedRoute>} />
          <Route path="/staff/dayof" element={<ProtectedRoute allowedRole="STAFF"><DayOfDashboard /></ProtectedRoute>} />
          <Route path="/staff/guest/:guestId" element={<ProtectedRoute allowedRole="STAFF"><GuestDetails /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
