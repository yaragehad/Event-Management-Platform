const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/booking.js')

router.get('/', bookingController.getAllBookings)
router.post('/', bookingController.createBooking)
router.put('/:id/status', bookingController.updateBookingStatus)

module.exports = router