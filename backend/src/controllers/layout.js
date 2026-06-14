
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
    const { venueId, eventId, elements } = req.body
    if (!venueId || !eventId || !elements) {
      return res.status(400).json({ error: 'venueId, eventId and elements are required' })
    }
    const layout = await prisma.layout.create({
      data: {
        venueId: parseInt(venueId),
        eventId: parseInt(eventId),
        elements
      }
    })
    res.status(201).json(layout)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save layout' })
  }
}

module.exports = { getLayout, saveLayout }