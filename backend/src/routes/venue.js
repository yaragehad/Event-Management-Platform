const express = require('express')
const router = express.Router()
const venueController = require('../controllers/venue')

router.get('/', venueController.getAllVenues)
router.get('/:id', venueController.getVenueById)
router.post('/', venueController.createVenue)
router.put('/:id', venueController.updateVenue)
router.delete('/:id/permanent', venueController.permanentDeleteVenue)
router.delete('/:id', venueController.deleteVenue)

module.exports = router