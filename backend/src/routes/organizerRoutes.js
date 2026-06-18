const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getOrganizerEvents,
  getOrganizerTasks,
  getOrganizerStaff,
  getOrganizerGuests,
  getVendors,
  getEventBudget,
  toggleUserActive,
  // Account management
  createStakeholderAccount,
  updateOrganizerProfile,
  // Budget CRUD
  createOrUpdateBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  addExpense,
  updateExpense,
  deleteExpense,
  // Task management
  createTask,
  updateTask,
  // Sourcing
  getOrganizerSourcingRequests,
  createSourcingRequest,
  // Invoices
  getOrganizerInvoices,
  updateInvoiceStatus,
  // Day-Of
  getDayOfDashboard,
  sendMessage,
  // Task Reminders
  sendTaskReminders,
  // Feedback & Reports
  getOrganizerFeedback,
  getEventReport,
} = require('../controllers/organizerController');

// ── Existing Routes ────────────────────────────────────────────────────────────
router.get('/dashboard/:id', getDashboardSummary);
router.get('/events/:id', getOrganizerEvents);
router.get('/tasks/:id', getOrganizerTasks);
router.get('/staff/:id', getOrganizerStaff);
router.get('/guests/:id', getOrganizerGuests);
router.get('/vendors', getVendors);
router.get('/budget/:eventId', getEventBudget);
router.patch('/users/:userId/toggle-active', toggleUserActive);

// ── Account Management ─────────────────────────────────────────────────────────
router.post('/accounts', createStakeholderAccount);
router.put('/profile/:id', updateOrganizerProfile);

// ── Budget CRUD ────────────────────────────────────────────────────────────────
router.post('/budget/:eventId', createOrUpdateBudget);
router.post('/budget/:eventId/items', addBudgetItem);
router.put('/budget/items/:itemId', updateBudgetItem);
router.delete('/budget/items/:itemId', deleteBudgetItem);
router.post('/budget/:eventId/expenses', addExpense);
router.put('/budget/expenses/:expenseId', updateExpense);
router.delete('/budget/expenses/:expenseId', deleteExpense);

// ── Task Management ────────────────────────────────────────────────────────────
router.post('/tasks/reminders/:id', sendTaskReminders);
router.post('/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);

// ── Sourcing Requests ──────────────────────────────────────────────────────────
router.get('/sourcing/:id', getOrganizerSourcingRequests);
router.post('/sourcing', createSourcingRequest);

// ── Invoices ───────────────────────────────────────────────────────────────────
router.get('/invoices/:id', getOrganizerInvoices);
router.put('/invoices/:invoiceId/status', updateInvoiceStatus);

// ── Day-Of Operations ──────────────────────────────────────────────────────────
router.get('/dayof/:eventId', getDayOfDashboard);
router.post('/messages/:eventId', sendMessage);

// ── Feedback & Reports ─────────────────────────────────────────────────────────
router.get('/feedback/:id', getOrganizerFeedback);
router.get('/report/:eventId', getEventReport);

module.exports = router;
