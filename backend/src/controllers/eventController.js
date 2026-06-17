const prisma = require('../lib/prismaClient')

// GET /api/events/:id - get single event
const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        booking: {
          include: {
            venue: true,
          },
        },
      },
    })
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(event)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
}

// GET /api/events - get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        booking: {
          include: {
            venue: true,
          },
        },
      },
    })
    res.json(events)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

module.exports = { getEventById, getAllEvents }