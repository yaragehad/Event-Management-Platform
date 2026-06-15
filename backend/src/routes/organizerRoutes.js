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
} = require('../controllers/organizerController');

// Dashboard summary stats
router.get('/dashboard/:id', getDashboardSummary);

// Events list (with optional filters: ?status=&dateFrom=&dateTo=)
router.get('/events/:id', getOrganizerEvents);

// Tasks list (with optional filters: ?status=&eventId=)
router.get('/tasks/:id', getOrganizerTasks);

// Staff list (with optional filters: ?specialty=&employmentType=)
router.get('/staff/:id', getOrganizerStaff);

// Guest list (with optional filters: ?eventId=&rsvpStatus=&search=)
router.get('/guests/:id', getOrganizerGuests);

// Vendor list (with optional search: ?search=)
router.get('/vendors', getVendors);

// Budget for a specific event
router.get('/budget/:eventId', getEventBudget);

module.exports = router;
