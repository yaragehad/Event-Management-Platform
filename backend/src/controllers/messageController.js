const prisma = require('../lib/prismaClient')

const sendMessage = async (req, res) => {
  try {
    const { senderId, content, eventId } = req.body
    if (!senderId || !content || !eventId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        content,
        eventId: parseInt(eventId),
      },
    })
    res.status(201).json(message)
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