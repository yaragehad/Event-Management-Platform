const express = require('express')
const router = express.Router()
const {
  getGuests,
  getGuestById,
  getGuestByUserId,
  lookupGuest,
  registerGuest,
  submitRSVP,
  updateRSVP,
  submitFeedback,
  getEventThreads,
  getThread,
  broadcastMessage,
  sendFollowUp,
  sendThreadMessage,
  markThreadSeen,
  checkInGuest,
  getCheckInList,
  getDayOfDashboard,
} = require('../controllers/guestController')

// Guest routes
router.get('/', getGuests)
router.get('/lookup', lookupGuest)
router.post('/register', registerGuest)

// Find guest by their user id (used after login) — keep ABOVE /:id
router.get('/by-user/:userId', getGuestByUserId)

// RSVP routes
router.post('/rsvp', submitRSVP)
router.patch('/rsvp/:id', updateRSVP)

// Feedback routes
router.post('/feedback', submitFeedback)

// Messaging (chat) routes — keep ABOVE /:id
router.get('/messages/event/:eventId/threads', getEventThreads)
router.get('/messages/thread/:eventId/:guestId', getThread)
router.post('/messages/organizer-broadcast', broadcastMessage)
router.post('/messages/follow-up', sendFollowUp)
router.post('/messages/send', sendThreadMessage)
router.patch('/messages/seen', markThreadSeen)

// Check-in list (staff) — keep ABOVE /:id
router.get('/checkin-list/:eventId', getCheckInList)

// Dashboard route
router.get('/dashboard/:eventId', getDayOfDashboard)

// Check-in route — :eventId makes check-in per-event
router.patch('/:id/checkin/:eventId', checkInGuest)

// Single guest — keep LAST so it doesn't swallow /lookup, /messages, etc.
router.get('/:id', getGuestById)

module.exports = router