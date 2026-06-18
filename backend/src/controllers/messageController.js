const prisma = require('../lib/prismaClient')

const sendMessage = async (req, res) => {
  try {
    const { senderId, content, eventId } = req.body
    if (!senderId || !content || !eventId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      select: { organizerId: true, name: true },
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // Create a notification for the organizer
    const notification = await prisma.notification.create({
      data: {
        userId: event.organizerId,
        title: 'Vendor Notification',
        message: content,
        link: '/organizer/dashboard',
      },
    })

    res.status(201).json(notification)
  } catch (err) {
    console.error('Message error:', err)
    res.status(500).json({ error: 'Failed to send message', details: err.message })
  }
}

const getMessages = async (req, res) => {
  try {
    const { eventId } = req.params
    const messages = await prisma.message.findMany({
      where: { eventId: parseInt(eventId) },
      orderBy: { sentAt: 'asc' },
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}

module.exports = { sendMessage, getMessages }