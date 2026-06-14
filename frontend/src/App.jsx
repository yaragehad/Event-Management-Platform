import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/vendor/requests" element={<SourcingRequests />} />
        <Route path="/vendor/requests/:id" element={<RequestDetail />} />
        <Route path="/vendor/deliveries" element={<DeliveryManagement />} />
        <Route path="/vendor/invoices" element={<InvoiceList />} />
        <Route path="/vendor/invoices/create" element={<CreateInvoice />} />

        {/* Organizer Routes */}
        <Route path="/organizer/vendors" element={<VendorList />} />
        <Route path="/organizer/vendors/:id" element={<VendorDetail />} />
        <Route path="/organizer/invoices" element={<OrganizerInvoices />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;