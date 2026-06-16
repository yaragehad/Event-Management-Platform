import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Vendors
export const getVendors = (search) => API.get('/vendors', { params: { search } });
export const getVendorById = (id) => API.get(`/vendors/${id}`);
export const updateVendor = (id, data) => API.put(`/vendors/${id}`, data);

// Sourcing Requests
export const getSourcingRequests = (params) => API.get('/sourcing-requests', { params });
export const getRequestById = (id) => API.get(`/sourcing-requests/${id}`);
export const updateRequestStatus = (id, status) => API.patch(`/sourcing-requests/${id}/status`, { status });

// Deliveries
export const getDeliveries = (params) => API.get('/deliveries', { params });
export const getDeliveryById = (id) => API.get(`/deliveries/${id}`);
export const updateDeliveryStatus = (id, status) => API.patch(`/deliveries/${id}/status`, { status });

// Invoices
export const getInvoices = (params) => API.get('/invoices', { params });
export const getInvoiceById = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (data) => API.post('/invoices', data);
export const updateInvoiceStatus = (id, status) => API.patch(`/invoices/${id}/status`, { status });

// Messages
export const sendMessage = (data) => API.post('/messages', data);
export const getMessages = (eventId) => API.get(`/messages/event/${eventId}`);