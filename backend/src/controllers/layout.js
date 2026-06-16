const prisma = require('../lib/prismaClient');

const getLayout = async (req, res) => {
  try {
    const layout = await prisma.layout.findFirst({
      where: { venueId: parseInt(req.params.venueId) }
    })
    res.json(layout)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch layout' })
  }
}

const saveLayout = async (req, res) => {
  try {
    const { venueId, elements } = req.body
    if (!venueId || !elements) {
      return res.status(400).json({ error: 'venueId and elements are required' })
    }

    const vid = parseInt(venueId)

    const venue = await prisma.venue.findUnique({ where: { id: vid } })
    if (!venue) {
      return res.status(404).json({ error: 'Venue with id ' + vid + ' does not exist' })
    }

    const existing = await prisma.layout.findFirst({ where: { venueId: vid } })

    let layout
    if (existing) {
      layout = await prisma.layout.update({
        where: { id: existing.id },
        data: { elements }
      })
    } else {
      const anyEvent = await prisma.event.findFirst()
      if (!anyEvent) {
        return res.status(400).json({ error: 'No events exist yet. Create an event first or seed the database.' })
      }
      layout = await prisma.layout.create({
        data: { venueId: vid, eventId: anyEvent.id, elements }
      })
    }

    res.status(201).json(layout)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save layout' })
  }
}

module.exports = { getLayout, saveLayout }