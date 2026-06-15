const express = require('express')
const router = express.Router()
const { getAllRequests, getRequestById, createRequest, updateRequestStatus } = require('../controllers/sourcingRequestController')
router.get('/', getAllRequests)
router.get('/:id', getRequestById)
router.post('/', createRequest)
router.patch('/:id/status', updateRequestStatus)
module.exports = router