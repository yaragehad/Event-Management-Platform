const prisma = require('../lib/prismaClient');

const getAllBookings = async (req, res) => {
  try {
    const { organizerId, venueId } = req.query
    const filters = {}
    if (organizerId) filters.organizerId = parseInt(organizerId)
    if (venueId) filters.venueId = parseInt(venueId)

    const bookings = await prisma.booking.findMany({
      where: filters,
      include: { venue: true, organizer: true }
    })
    res.json(bookings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

const createBooking = async (req, res) => {
  try {
    const { venueId, organizerId, eventDate, notes } = req.body
    if (!venueId || !organizerId || !eventDate) {
      return res.status(400).json({ error: 'venueId, organizerId and eventDate are required' })
    }
    const booking = await prisma.booking.create({
      data: {
        venueId: parseInt(venueId),
        organizerId: parseInt(organizerId),
        eventDate: new Date(eventDate),
        notes
      }
    })
    res.status(201).json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['APPROVED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or DECLINED' })
    }
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
}

module.exports = { getAllBookings, createBooking, updateBookingStatus }