const prisma = require('../lib/prismaClient')

// GET /api/direct-messages/thread/:userId/:otherId
// Returns full conversation between two users, ordered oldest-first
const getThread = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const otherId = parseInt(req.params.otherId)
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { sentAt: 'asc' },
    })
    // Mark received messages as seen
    await prisma.directMessage.updateMany({
      where: { senderId: otherId, receiverId: userId, seenByReceiver: false },
      data: { seenByReceiver: true },
    })
    res.json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch thread' })
  }
}

// POST /api/direct-messages/send
// Body: { senderId, receiverId, content }
const sendDirect = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body
    if (!senderId || !receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'senderId, receiverId and content are required' })
    }
    const message = await prisma.directMessage.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content: content.trim(),
      },
      include: { sender: { select: { id: true, name: true } } },
    })
    res.status(201).json(message)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// GET /api/direct-messages/contacts/:organizerId?role=STAFF|VENDOR
// Returns staff or vendor users linked to the organizer's events, with last message preview
const getContacts = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.organizerId)
    const { role } = req.query

    if (!role || !['STAFF', 'VENDOR'].includes(role)) {
      return res.status(400).json({ error: 'role must be STAFF or VENDOR' })
    }

    let userIds = []

    if (role === 'STAFF') {
      const assignments = await prisma.staffAssignment.findMany({
        where: { event: { organizerId } },
        select: { userId: true },
        distinct: ['userId'],
      })
      userIds = assignments.map(a => a.userId)
    } else {
      // VENDOR: vendors who have received sourcing requests from this organizer
      const requests = await prisma.sourcingRequest.findMany({
        where: { event: { organizerId } },
        select: { vendor: { select: { userId: true } } },
        distinct: ['vendorId'],
      })
      userIds = requests.map(r => r.vendor?.userId).filter(Boolean)
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })

    // Attach last message and unread count for each contact
    const contacts = await Promise.all(users.map(async (u) => {
      const last = await prisma.directMessage.findFirst({
        where: {
          OR: [
            { senderId: organizerId, receiverId: u.id },
            { senderId: u.id, receiverId: organizerId },
          ],
        },
        orderBy: { sentAt: 'desc' },
      })
      const unread = await prisma.directMessage.count({
        where: { senderId: u.id, receiverId: organizerId, seenByReceiver: false },
      })
      return { ...u, lastMessage: last?.content || null, lastAt: last?.sentAt || null, unread }
    }))

    res.json(contacts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
}

module.exports = { getThread, sendDirect, getContacts }
