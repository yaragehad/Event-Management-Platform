const prisma = require('../lib/prismaClient');
const getAllVenues = async (req, res) => {
  try {
    const { city, minCapacity } = req.query
    const filters = { isActive: true }
    if (city) filters.city = { contains: city, mode: 'insensitive' }
    if (minCapacity) filters.capacity = { gte: parseInt(minCapacity) }

    const venues = await prisma.venue.findMany({ where: filters, orderBy: { createdAt: 'desc' } })
    res.json(venues)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch venues' })
  }
}

const getVenueById = async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!venue) return res.status(404).json({ error: 'Venue not found' })
    res.json(venue)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch venue' })
  }
}

const createVenue = async (req, res) => {
  try {
    const { name, description, location, city, capacity, areaM2, amenities, pricePerDay, photos, ownerId } = req.body
    if (!name || !location || !city || !capacity || !pricePerDay || !ownerId) {
      return res.status(400).json({ error: 'name, location, city, capacity, pricePerDay and ownerId are required' })
    }
    const venue = await prisma.venue.create({
      data: {
        name, description, location, city,
        capacity: parseInt(capacity),
        areaM2: areaM2 ? parseFloat(areaM2) : null,
        amenities,
        pricePerDay: parseFloat(pricePerDay),
        photos: photos || [],
        ownerId: parseInt(ownerId)
      }
    })
    res.status(201).json(venue)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create venue' })
  }
}

const updateVenue = async (req, res) => {
  try {
    const venue = await prisma.venue.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json(venue)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update venue' })
  }
}

const deleteVenue = async (req, res) => {
  try {
    await prisma.venue.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    })
    res.json({ message: 'Venue deactivated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to deactivate venue' })
  }
}

module.exports = { getAllVenues, getVenueById, createVenue, updateVenue, deleteVenue }