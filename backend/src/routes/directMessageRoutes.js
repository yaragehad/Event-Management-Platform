const express = require('express')
const router = express.Router()
const { getThread, sendDirect, getContacts } = require('../controllers/directMessageController')

router.get('/contacts/:organizerId', getContacts)
router.get('/thread/:userId/:otherId', getThread)
router.post('/send', sendDirect)

module.exports = router
