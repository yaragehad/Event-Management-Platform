const prisma = require('../lib/prismaClient')

// GET /api/guests - get all guests
const getGuests = async (req, res) => {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        user: { select: { name: true, email: true } },
        rsvps: true,
      },
    })
    res.json(guests)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guests' })
  }
}

// GET /api/guests/:id - get single guest
const getGuestById = async (req, res) => {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { name: true, email: true } },
        rsvps: true,
        events: true,
      },
    })
    if (!guest) return res.status(404).json({ error: 'Guest not found' })
    res.json(guest)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guest' })
  }
}

// POST /api/guests/rsvp - submit RSVP
const submitRSVP = async (req, res) => {
  try {
    const { guestId, eventId, status, dietaryPreference } = req.body
    const rsvp = await prisma.rSVP.create({
      data: { guestId, eventId, status },
    })
    if (dietaryPreference) {
      await prisma.guest.update({
        where: { id: guestId },
        data: { dietaryPreference },
      })
    }
    res.json({ message: 'RSVP submitted successfully!', rsvp })
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit RSVP' })
  }
}

// PATCH /api/guests/rsvp/:id - update RSVP
const updateRSVP = async (req, res) => {
  try {
    const { status, dietaryPreference } = req.body
    const rsvp = await prisma.rSVP.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    if (dietaryPreference) {
      await prisma.guest.update({
        where: { id: rsvp.guestId },
        data: { dietaryPreference },
      })
    }
    res.json({ message: 'RSVP updated successfully!', rsvp })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update RSVP' })
  }
}

// POST /api/guests/feedback - submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { eventId, guestName, overall, food, venue, organization, comments } = req.body
    const feedback = await prisma.feedback.create({
      data: { eventId, guestName, overall, food, venue, organization, comments },
    })
    res.json({ message: 'Thank you for your feedback!', feedback })
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
}

// POST /api/guests/messages - send day-of message
const sendMessage = async (req, res) => {
  try {
    const { eventId, senderId, content } = req.body
    const message = await prisma.message.create({
      data: { eventId, senderId, content },
    })
    res.json({ message: 'Message sent!', data: message })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// GET /api/guests/messages/:eventId - get all messages for an event
const getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { eventId: parseInt(req.params.eventId) },
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}

// PATCH /api/guests/messages/:id/seen - mark message as seen
const markMessageSeen = async (req, res) => {
  try {
    const { userId } = req.body
    const message = await prisma.message.findUnique({
      where: { id: parseInt(req.params.id) },
    })
    if (!message) return res.status(404).json({ error: 'Message not found' })
    const updatedSeenByIds = [...new Set([...message.seenByIds, userId])]
    const updated = await prisma.message.update({
      where: { id: parseInt(req.params.id) },
      data: { seenByIds: updatedSeenByIds },
    })
    res.json({ message: 'Message marked as seen', data: updated })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message status' })
  }
}

// PATCH /api/guests/:id/checkin - check in guest
const checkInGuest = async (req, res) => {
  try {
    const guest = await prisma.guest.update({
      where: { id: parseInt(req.params.id) },
      data: { checkInStatus: true },
    })
    res.json({ message: 'Guest checked in successfully!', guest })
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in guest' })
  }
}

// GET /api/guests/dashboard/:eventId - day-of dashboard
const getDayOfDashboard = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const totalGuests = await prisma.guest.count({
      where: { events: { some: { id: eventId } } },
    })
    const arrivedGuests = await prisma.guest.count({
      where: {
        events: { some: { id: eventId } },
        checkInStatus: true,
      },
    })
    res.json({ totalGuests, arrivedGuests })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}

module.exports = {
  getGuests,
  getGuestById,
  submitRSVP,
  updateRSVP,
  submitFeedback,
  sendMessage,
  getMessages,
  markMessageSeen,
  checkInGuest,
  getDayOfDashboard,
}