const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/booking.js')
const bookingMessageController = require('../controllers/bookingMessage.js')

router.get('/', bookingController.getAllBookings)
router.post('/', bookingController.createBooking)
router.put('/:id/status', bookingController.updateBookingStatus)
router.get('/:bookingId/messages', bookingMessageController.getMessages)
router.post('/:bookingId/messages', bookingMessageController.sendMessage)

module.exports = router