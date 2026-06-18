const prisma = require('../lib/prismaClient')
const crypto = require('crypto')
const { notifyBroadcast } = require('./emailController')

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

// GET /api/guests/by-user/:userId - get guest profile by user ID
const getGuestByUserId = async (req, res) => {
  try {
    const guest = await prisma.guest.findUnique({
      where: { userId: parseInt(req.params.userId) },
      include: {
        user: { select: { name: true, email: true } },
        events: true,
        rsvps: true,
      },
    })
    if (!guest) return res.status(404).json({ error: 'Guest profile not found' })
    res.json(guest)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guest profile' })
  }
}

// GET /api/guests/lookup?email=&eventId= - first-time check
const lookupGuest = async (req, res) => {
  try {
    const { email, eventId } = req.query
    if (!email || !eventId) return res.status(400).json({ error: 'email and eventId are required' })
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { guestProfile: { include: { rsvps: true } } },
    })
    if (!user || !user.guestProfile) return res.json({ registered: false })
    const rsvp = user.guestProfile.rsvps.find(r => r.eventId === parseInt(eventId))
    res.json({
      registered: true,
      guestId: user.guestProfile.id,
      name: user.name,
      rsvpStatus: rsvp ? rsvp.status : 'PENDING',
    })
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' })
  }
}

// POST /api/guests/register - first-time registration
const registerGuest = async (req, res) => {
  try {
    const { eventId, name, email, dietaryPreference, status } = req.body
    if (!eventId || !name || !email) return res.status(400).json({ error: 'name, email and eventId are required' })
    const cleanEmail = email.toLowerCase().trim()
    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { guestProfile: true },
    })
    if (!user) {
      user = await prisma.user.create({
        data: { name, email: cleanEmail, password: crypto.randomBytes(32).toString('hex'), role: 'GUEST' },
        include: { guestProfile: true },
      })
    }

    let guest = user.guestProfile
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          userId: user.id,
          dietaryPreference: dietaryPreference || null,
          events: { connect: { id: event.id } },
        },
      })
    } else {
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          dietaryPreference: dietaryPreference || guest.dietaryPreference,
          events: { connect: { id: event.id } },
        },
      })
    }

    let rsvp = await prisma.rSVP.findFirst({ where: { guestId: guest.id, eventId: event.id } })
    if (!rsvp) {
      rsvp = await prisma.rSVP.create({
        data: { guestId: guest.id, eventId: event.id, status: status || 'PENDING' },
      })
    }

    res.status(201).json({ message: 'Registered successfully!', guestId: guest.id, rsvpId: rsvp.id })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
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
    const { guestId, eventId, status, dietaryPreference, notes } = req.body
    const rsvp = await prisma.rSVP.create({
      data: { guestId, eventId, status, notes: notes || null },
    })
    if (status === 'ATTENDING') {
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          events: { connect: { id: parseInt(eventId) } },
          ...(dietaryPreference ? { dietaryPreference } : {}),
        },
      })
    } else if (dietaryPreference) {
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
    const { status, dietaryPreference, notes } = req.body
    const rsvp = await prisma.rSVP.update({
      where: { id: parseInt(req.params.id) },
      data: { status, notes: notes || null },
    })
    if (status === 'ATTENDING') {
      await prisma.guest.update({
        where: { id: rsvp.guestId },
        data: {
          events: { connect: { id: rsvp.eventId } },
          ...(dietaryPreference ? { dietaryPreference } : {}),
        },
      })
    } else if (dietaryPreference) {
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

// ─── MESSAGING (CHAT) ────────────────────────────────────────────────────────

// GET /api/guests/messages/event/:eventId/threads - organizer: list guests + unseen counts
const getEventThreads = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: eventId } } },
      include: { user: { select: { name: true, email: true } } },
    })
    const threads = await Promise.all(
      guests.map(async (g) => {
        const messages = await prisma.message.findMany({
          where: { eventId, guestId: g.id },
          orderBy: { sentAt: 'asc' },
        })
        const lastMsg = messages[messages.length - 1] || null
        const unreadFromGuest = messages.filter(m => m.senderRole === 'GUEST' && !m.seenByOrganizer).length
        return {
          guestId: g.id,
          name: g.user.name,
          email: g.user.email,
          lastMessage: lastMsg ? lastMsg.content : null,
          lastAt: lastMsg ? lastMsg.sentAt : null,
          unreadFromGuest,
          totalMessages: messages.length,
        }
      })
    )
    res.json(threads)
  } catch (err) {
    console.error('THREADS ERROR:', err)
    res.status(500).json({ error: 'Failed to fetch threads' })
  }
}

// GET /api/guests/messages/thread/:eventId/:guestId - full conversation
const getThread = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const guestId = parseInt(req.params.guestId)
    const messages = await prisma.message.findMany({
      where: { eventId, guestId },
      orderBy: { sentAt: 'asc' },
    })
    res.json(messages)
  } catch (err) {
    console.error('THREAD ERROR:', err)
    res.status(500).json({ error: 'Failed to fetch thread' })
  }
}

// POST /api/guests/messages/organizer-broadcast - organizer sends to ALL guests of an event
const broadcastMessage = async (req, res) => {
  try {
    const { eventId, content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' })
    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: parseInt(eventId) } } },
    })
    if (guests.length === 0) return res.status(400).json({ error: 'No guests for this event' })
    await prisma.message.createMany({
      data: guests.map(g => ({
        eventId: parseInt(eventId),
        guestId: g.id,
        senderRole: 'ORGANIZER',
        content: content.trim(),
      })),
    })
    // notify guests by email (runs in background, won't block the response)
    notifyBroadcast(eventId, content.trim())
    res.status(201).json({ message: `Sent to ${guests.length} guest(s)` })
  } catch (err) {
    console.error('BROADCAST ERROR:', err)
    res.status(500).json({ error: 'Failed to broadcast' })
  }
}

// POST /api/guests/messages/follow-up - resend to guests who haven't SEEN the organizer's messages
const sendFollowUp = async (req, res) => {
  try {
    const { eventId, content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' })
    const eId = parseInt(eventId)

    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: eId } } },
    })
    const unseenGuests = []
    for (const g of guests) {
      const unseen = await prisma.message.count({
        where: { eventId: eId, guestId: g.id, senderRole: 'ORGANIZER', seenByGuest: false },
      })
      if (unseen > 0) unseenGuests.push(g)
    }

    if (unseenGuests.length === 0) {
      return res.json({ message: 'All guests have already seen your messages — no follow-up needed.', count: 0 })
    }

    await prisma.message.createMany({
      data: unseenGuests.map(g => ({
        eventId: eId,
        guestId: g.id,
        senderRole: 'ORGANIZER',
        content: content.trim(),
      })),
    })
    res.status(201).json({ message: `Follow-up sent to ${unseenGuests.length} guest(s) who hadn't seen your message.`, count: unseenGuests.length })
  } catch (err) {
    console.error('FOLLOWUP ERROR:', err)
    res.status(500).json({ error: 'Failed to send follow-up' })
  }
}

// POST /api/guests/messages/send - send one message in a thread (organizer OR guest)
const sendThreadMessage = async (req, res) => {
  try {
    const { eventId, guestId, senderRole, content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required' })
    if (!['ORGANIZER', 'GUEST'].includes(senderRole)) return res.status(400).json({ error: 'Invalid senderRole' })
    const msg = await prisma.message.create({
      data: {
        eventId: parseInt(eventId),
        guestId: parseInt(guestId),
        senderRole,
        content: content.trim(),
      },
    })
    res.status(201).json(msg)
  } catch (err) {
    console.error('SEND ERROR:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

// PATCH /api/guests/messages/seen - mark a thread's messages seen by the reader
const markThreadSeen = async (req, res) => {
  try {
    const { eventId, guestId, reader } = req.body
    if (reader === 'ORGANIZER') {
      await prisma.message.updateMany({
        where: { eventId: parseInt(eventId), guestId: parseInt(guestId), senderRole: 'GUEST' },
        data: { seenByOrganizer: true },
      })
    } else if (reader === 'GUEST') {
      await prisma.message.updateMany({
        where: { eventId: parseInt(eventId), guestId: parseInt(guestId), senderRole: 'ORGANIZER' },
        data: { seenByGuest: true },
      })
    } else {
      return res.status(400).json({ error: 'Invalid reader' })
    }
    res.json({ message: 'Marked seen' })
  } catch (err) {
    console.error('SEEN ERROR:', err)
    res.status(500).json({ error: 'Failed to mark seen' })
  }
}

// ─── CHECK-IN & DASHBOARD ────────────────────────────────────────────────────

// PATCH /api/guests/:id/checkin/:eventId - check in guest for a specific event
const checkInGuest = async (req, res) => {
  try {
    const guestId = parseInt(req.params.id)
    const eventId = parseInt(req.params.eventId)

    // Verify the guest is actually invited to this event
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, events: { some: { id: eventId } } },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!guest) {
      return res.status(400).json({ error: 'This guest is not invited to this event.' })
    }

    // Find existing RSVP for this guest + event
    const existingRsvp = await prisma.rSVP.findFirst({
      where: { guestId, eventId },
    })

    if (existingRsvp) {
      await prisma.rSVP.update({
        where: { id: existingRsvp.id },
        data: { checkedIn: true },
      })
    } else {
      await prisma.rSVP.create({
        data: { guestId, eventId, status: 'ATTENDING', checkedIn: true },
      })
    }

    // Keep global checkInStatus = true for backward compatibility
    await prisma.guest.update({
      where: { id: guestId },
      data: { checkInStatus: true },
    })

    res.json({
      message: 'Guest checked in successfully!',
      guestId: guest.id,
      name: guest.user.name,
      email: guest.user.email,
    })
  } catch (err) {
    console.error('CHECKIN ERROR:', err)
    res.status(500).json({ error: 'Failed to check in guest' })
  }
}

// GET /api/guests/checkin-list/:eventId - staff: all guests of an event + per-event check-in status
const getCheckInList = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: eventId } } },
      include: {
        user: { select: { name: true, email: true } },
        rsvps: { where: { eventId } },
      },
    })
    res.json(guests.map(g => {
      const rsvp = g.rsvps[0]
      return {
        guestId: g.id,
        name: g.user.name,
        email: g.user.email,
        checkInStatus: g.checkInStatus,   // kept for any backward-compat readers
        checkedIn: rsvp ? rsvp.checkedIn : false,
      }
    }))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch check-in list' })
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
  getGuestByUserId,
  lookupGuest,
  registerGuest,
  submitRSVP,
  updateRSVP,
  submitFeedback,
  getEventThreads,
  getThread,
  broadcastMessage,
  sendFollowUp,
  sendThreadMessage,
  markThreadSeen,
  checkInGuest,
  getCheckInList,
  getDayOfDashboard,
}