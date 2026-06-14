const express = require('express')
const router = express.Router()
const {
  getGuests,
  getGuestById,
  submitRSVP,
  updateRSVP,
  submitFeedback,
  sendMessage,
  getMessages,
  markMessageSeen,
  checkInGuest,
  getDayOfDashboard,
} = require('../controllers/guestController')

// Guest routes
router.get('/', getGuests)
router.get('/:id', getGuestById)

// RSVP routes
router.post('/rsvp', submitRSVP)
router.patch('/rsvp/:id', updateRSVP)

// Feedback routes
router.post('/feedback', submitFeedback)

// Message routes
router.post('/messages', sendMessage)
router.get('/messages/:eventId', getMessages)
router.patch('/messages/:id/seen', markMessageSeen)

// Check-in routes
router.patch('/:id/checkin', checkInGuest)

// Dashboard route
router.get('/dashboard/:eventId', getDayOfDashboard)

module.exports = router