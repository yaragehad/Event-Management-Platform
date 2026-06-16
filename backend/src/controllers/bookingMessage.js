const prisma = require('../lib/prismaClient');

const getMessages = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const messages = await prisma.bookingMessage.findMany({
      where: { bookingId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const { senderId, content } = req.body;
    if (!senderId || !content) {
      return res.status(400).json({ error: 'senderId and content are required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { venue: true, organizer: { select: { id: true, name: true } } }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const message = await prisma.bookingMessage.create({
      data: { bookingId, senderId: parseInt(senderId), content },
      include: { sender: { select: { id: true, name: true, role: true } } }
    });

    // Notify the other party. If the venue owner sent it, notify the organizer; otherwise notify the venue owner.
    const recipientId = parseInt(senderId) === booking.organizer.id ? booking.venue.ownerId : booking.organizer.id;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'New Message on Booking',
        message: `${message.sender.name}: ${content.length > 80 ? content.slice(0, 80) + '…' : content}`,
        link: recipientId === booking.venue.ownerId ? '/venue/bookings' : '/organizer/bookings'
      }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

module.exports = { getMessages, sendMessage };
