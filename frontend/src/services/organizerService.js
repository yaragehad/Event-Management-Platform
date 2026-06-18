import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3001/api' })

// ── Existing ───────────────────────────────────────────────────────────────────
export const getDashboardSummary = (organizerId) =>
  API.get(`/organizer/dashboard/${organizerId}`)

export const getOrganizerEvents = (organizerId, filters = {}) =>
  API.get(`/organizer/events/${organizerId}`, { params: filters })

export const getOrganizerTasks = (organizerId, filters = {}) =>
  API.get(`/organizer/tasks/${organizerId}`, { params: filters })

export const getOrganizerStaff = (organizerId, filters = {}) =>
  API.get(`/organizer/staff/${organizerId}`, { params: filters })

export const getOrganizerGuests = (organizerId, filters = {}) =>
  API.get(`/organizer/guests/${organizerId}`, { params: filters })

export const getVendors = (filters = {}) =>
  API.get(`/organizer/vendors`, { params: filters })

export const getEventBudget = (eventId) =>
  API.get(`/organizer/budget/${eventId}`)

export const toggleUserActive = (userId) =>
  API.patch(`/organizer/users/${userId}/toggle-active`)

// ── Account Management ─────────────────────────────────────────────────────────
export const createStakeholderAccount = (data) =>
  API.post('/organizer/accounts', data)

export const updateOrganizerProfile = (userId, data) =>
  API.put(`/organizer/profile/${userId}`, data)

// ── Budget CRUD ────────────────────────────────────────────────────────────────
export const createOrUpdateBudget = (eventId, data) =>
  API.post(`/organizer/budget/${eventId}`, data)

export const addBudgetItem = (eventId, data) =>
  API.post(`/organizer/budget/${eventId}/items`, data)

export const updateBudgetItem = (itemId, data) =>
  API.put(`/organizer/budget/items/${itemId}`, data)

export const deleteBudgetItem = (itemId) =>
  API.delete(`/organizer/budget/items/${itemId}`)

export const addExpense = (eventId, data) =>
  API.post(`/organizer/budget/${eventId}/expenses`, data)

export const updateExpense = (expenseId, data) =>
  API.put(`/organizer/budget/expenses/${expenseId}`, data)

export const deleteExpense = (expenseId) =>
  API.delete(`/organizer/budget/expenses/${expenseId}`)

// ── Task Management ────────────────────────────────────────────────────────────
export const createTask = (data) =>
  API.post('/organizer/tasks', data)

export const updateTask = (taskId, data) =>
  API.patch(`/organizer/tasks/${taskId}`, data)

// ── Sourcing Requests ──────────────────────────────────────────────────────────
export const getOrganizerSourcingRequests = (organizerId) =>
  API.get(`/organizer/sourcing/${organizerId}`)

export const createSourcingRequest = (data) =>
  API.post('/organizer/sourcing', data)

// ── Invoices ───────────────────────────────────────────────────────────────────
export const getOrganizerInvoices = (organizerId) =>
  API.get(`/organizer/invoices/${organizerId}`)

export const updateInvoiceStatus = (invoiceId, status) =>
  API.put(`/organizer/invoices/${invoiceId}/status`, { status })

// ── Day-Of Operations ──────────────────────────────────────────────────────────
export const getDayOfDashboard = (eventId) =>
  API.get(`/organizer/dayof/${eventId}`)

export const sendMessage = (eventId, data) =>
  API.post(`/organizer/messages/${eventId}`, data)

// ── Feedback & Reports ─────────────────────────────────────────────────────────
export const sendTaskReminders = (organizerId) =>
  API.post(`/organizer/tasks/reminders/${organizerId}`)

// ── Direct Messages (Staff & Vendor) ──────────────────────────────────────────
export const getDirectContacts = (organizerId, role) =>
  API.get(`/direct-messages/contacts/${organizerId}`, { params: { role } })

export const getDirectThread = (userId, otherId) =>
  API.get(`/direct-messages/thread/${userId}/${otherId}`)

export const sendDirectMessage = (senderId, receiverId, content) =>
  API.post('/direct-messages/send', { senderId, receiverId, content })

export const getOrganizerFeedback = (organizerId) =>
  API.get(`/organizer/feedback/${organizerId}`)

export const getEventReport = (eventId) =>
  API.get(`/organizer/report/${eventId}`)
