const express = require('express')
const router = express.Router()
const venueController = require('../controllers/venue')

router.get('/', venueController.getAllVenues)         // get all venues
router.get('/:id', venueController.getVenueById)      // get one venue by id
router.post('/', venueController.createVenue)         // create new venue
router.put('/:id', venueController.updateVenue)       // edit a venue
router.delete('/:id', venueController.deleteVenue)    // deactivate a venue

module.exports = router