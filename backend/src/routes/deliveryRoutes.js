const express = require('express')
const router = express.Router()
const { getAllDeliveries, getDeliveryById, updateDeliveryStatus } = require('../controllers/deliveryController')
router.get('/', getAllDeliveries)
router.get('/:id', getDeliveryById)
router.patch('/:id/status', updateDeliveryStatus)
module.exports = router