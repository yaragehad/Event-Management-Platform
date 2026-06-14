const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analytics')

router.get('/venue/:ownerId', analyticsController.getVenueAnalytics)

module.exports = router