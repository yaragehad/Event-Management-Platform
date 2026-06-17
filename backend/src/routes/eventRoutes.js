const express = require('express')
const router = express.Router()
const { getEventById, getAllEvents } = require('../controllers/eventController')

// Get all events
router.get('/', getAllEvents)

// Get single event
router.get('/:id', getEventById)

module.exports = router