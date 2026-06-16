const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.js')

router.get('/:userId', notificationController.getNotifications)
router.put('/:id/read', notificationController.markAsRead)
router.put('/read-all/:userId', notificationController.markAllAsRead)

module.exports = router
