const express = require('express')
const router = express.Router()
const {
  sendInvitationEmail,
  sendInvitationsToAll,
  sendRSVPConfirmation,
  sendCheckInConfirmation,
  sendFeedbackLinks,
  sendFeedbackThankYou,
} = require('../controllers/emailController')

// Send invitation to a single guest
router.post('/send', sendInvitationEmail)

// Send invitations to all guests of an event
router.post('/send-all', sendInvitationsToAll)

// Send RSVP confirmation email
router.post('/rsvp-confirmation', sendRSVPConfirmation)

// Send check-in confirmation email
router.post('/checkin-confirmation', sendCheckInConfirmation)

// Send feedback links to all checked-in guests
router.post('/feedback-links', sendFeedbackLinks)

// Send thank-you email after feedback submission
router.post('/feedback-thankyou', sendFeedbackThankYou)

module.exports = router