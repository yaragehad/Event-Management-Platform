import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VenueListingsPage from './pages/venue/VenueListingsPage';
import CreateVenuePage from './pages/venue/CreateVenuePage';
import EditVenuePage from './pages/venue/EditVenuePage';
import VenueCalendarPage from './pages/venue/VenueCalendarPage';
import BookingRequestsPage from './pages/venue/BookingRequestsPage';
import LayoutDesignerPage from './pages/venue/LayoutDesignerPage';
import VenueOwnerDashboard from './pages/venue/VenueOwnerDashboard';
import VenueAnalyticsPage from './pages/venue/VenueAnalyticsPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTaskList from './pages/staff/StaffTaskList';
import StaffFloorPlan from './pages/staff/StaffFloorPlan';
import GuestCheckIn from './pages/staff/GuestCheckIn';
import VendorArrival from './pages/staff/VendorArrival';
import DayOfDashboard from './pages/staff/DayOfDashboard';
import GuestDetails from './pages/staff/GuestDetails';

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
        <Route path="/venue/analytics" element={<VenueAnalyticsPage />} />

        {/* Staff Routes - Member 5 */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/tasks" element={<StaffTaskList />} />
        <Route path="/staff/floorplan" element={<StaffFloorPlan />} />
        <Route path="/staff/checkin" element={<GuestCheckIn />} />
        <Route path="/staff/vendors" element={<VendorArrival />} />
        <Route path="/staff/dayof" element={<DayOfDashboard />} />
        <Route path="/staff/guest/:guestId" element={<GuestDetails />} />
      </Routes>
    </Router>
  );
}

export default App;