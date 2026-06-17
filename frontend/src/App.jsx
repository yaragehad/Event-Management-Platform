import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Auth Pages (Member 1)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Venue Pages (Member 2)
import VenueListingsPage from './pages/venue/VenueListingsPage';
import CreateVenuePage from './pages/venue/CreateVenuePage';
import EditVenuePage from './pages/venue/EditVenuePage';
import VenueCalendarPage from './pages/venue/VenueCalendarPage';
import BookingRequestsPage from './pages/venue/BookingRequestsPage';
import LayoutDesignerPage from './pages/venue/LayoutDesignerPage';
import VenueAnalyticsPage from './pages/venue/VenueAnalyticsPage';
import VenueOwnerDashboard from './pages/venue/VenueOwnerDashboard';
import VenueOwnerProfilePage from './pages/venue/VenueOwnerProfilePage';

// Organizer Pages (Member 1)
import OrganizerVenueSearchPage from './pages/organizer/OrganizerVenueSearchPage';
import OrganizerCreateBookingPage from './pages/organizer/OrganizerCreateBookingPage';
import OrganizerBookingStatusPage from './pages/organizer/OrganizerBookingStatusPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';

// Vendor Pages (Member 3 - Your pages)
import VendorDashboard from './pages/VendorDashboard';
import VendorProfile from './pages/VendorProfile';
import SourcingRequests from './pages/SourcingRequests';
import RequestDetail from './pages/RequestDetail';
import DeliveryManagement from './pages/DeliveryManagement';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceList from './pages/InvoiceList';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import OrganizerInvoices from './pages/OrganizerInvoices';

function RootRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ORGANIZER') return <Navigate to="/organizer/dashboard" replace />;
  if (user.role === 'VENUE_OWNER') return <Navigate to="/venue/dashboard" replace />;
  if (user.role === 'VENDOR') return <Navigate to="/vendor/dashboard" replace />;
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

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Venue Owner Routes */}
          <Route path="/venue/dashboard" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueOwnerDashboard /></ProtectedRoute>} />
          <Route path="/venue/listings" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueListingsPage /></ProtectedRoute>} />
          <Route path="/venue/create" element={<ProtectedRoute allowedRole="VENUE_OWNER"><CreateVenuePage /></ProtectedRoute>} />
          <Route path="/venue/edit/:id" element={<ProtectedRoute allowedRole="VENUE_OWNER"><EditVenuePage /></ProtectedRoute>} />
          <Route path="/venue/calendar/:id" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueCalendarPage /></ProtectedRoute>} />
          <Route path="/venue/bookings" element={<ProtectedRoute allowedRole="VENUE_OWNER"><BookingRequestsPage /></ProtectedRoute>} />
          <Route path="/venue/layout" element={<ProtectedRoute allowedRole="VENUE_OWNER"><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/venue/analytics" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueAnalyticsPage /></ProtectedRoute>} />
          <Route path="/venue/profile" element={<ProtectedRoute allowedRole="VENUE_OWNER"><VenueOwnerProfilePage /></ProtectedRoute>} />

          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/venues" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerVenueSearchPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings/new" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerCreateBookingPage /></ProtectedRoute>} />
          <Route path="/organizer/bookings" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerBookingStatusPage /></ProtectedRoute>} />
          <Route path="/organizer/layout/:venueId" element={<ProtectedRoute allowedRole="ORGANIZER"><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/organizer/layout" element={<ProtectedRoute allowedRole="ORGANIZER"><LayoutDesignerPage /></ProtectedRoute>} />
          <Route path="/organizer/vendors" element={<ProtectedRoute allowedRole="ORGANIZER"><VendorList /></ProtectedRoute>} />
          <Route path="/organizer/vendors/:id" element={<ProtectedRoute allowedRole="ORGANIZER"><VendorDetail /></ProtectedRoute>} />
          <Route path="/organizer/invoices" element={<ProtectedRoute allowedRole="ORGANIZER"><OrganizerInvoices /></ProtectedRoute>} />

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRole="VENDOR"><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/profile" element={<ProtectedRoute allowedRole="VENDOR"><VendorProfile /></ProtectedRoute>} />
          <Route path="/vendor/requests" element={<ProtectedRoute allowedRole="VENDOR"><SourcingRequests /></ProtectedRoute>} />
          <Route path="/vendor/requests/:id" element={<ProtectedRoute allowedRole="VENDOR"><RequestDetail /></ProtectedRoute>} />
          <Route path="/vendor/deliveries" element={<ProtectedRoute allowedRole="VENDOR"><DeliveryManagement /></ProtectedRoute>} />
          <Route path="/vendor/invoices" element={<ProtectedRoute allowedRole="VENDOR"><InvoiceList /></ProtectedRoute>} />
          <Route path="/vendor/invoices/create" element={<ProtectedRoute allowedRole="VENDOR"><CreateInvoice /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;