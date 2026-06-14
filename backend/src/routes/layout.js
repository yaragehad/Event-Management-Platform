const express = require('express')
const router = express.Router()
const layoutController = require('../controllers/layout')

router.get('/:venueId', layoutController.getLayout)
router.post('/', layoutController.saveLayout)

module.exports = router