const prisma = require('../lib/prismaClient');

const getAllBookings = async (req, res) => {
  try {
    const { organizerId, venueId, ownerId, status, dateFrom, dateTo } = req.query
    const filters = {}
    if (organizerId) filters.organizerId = parseInt(organizerId)
    if (venueId) filters.venueId = parseInt(venueId)
    if (ownerId) filters.venue = { ownerId: parseInt(ownerId) }
    if (status) filters.status = status
    if (dateFrom || dateTo) {
      filters.eventDate = {}
      if (dateFrom) filters.eventDate.gte = new Date(dateFrom)
      if (dateTo) filters.eventDate.lte = new Date(dateTo)
    }

    const bookings = await prisma.booking.findMany({
      where: filters,
      include: {
        venue: true,
        organizer: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { senderId: true, createdAt: true }
        }
      },
      orderBy: { eventDate: 'asc' }
    })
    res.json(bookings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

const createBooking = async (req, res) => {
  try {
    const { venueId, organizerId, eventDate, notes, eventType, attendeeCount } = req.body
    if (!venueId || !organizerId || !eventDate) {
      return res.status(400).json({ error: 'venueId, organizerId and eventDate are required' })
    }

    // ── Availability gate ─────────────────────────────────────────────────────
    const venue = await prisma.venue.findUnique({ where: { id: parseInt(venueId) } })
    if (!venue) return res.status(404).json({ error: 'Venue not found' })

    const requestedDateStr = new Date(eventDate).toISOString().split('T')[0]
    const isAvailable = venue.availableDates.some(
      d => new Date(d).toISOString().split('T')[0] === requestedDateStr
    )
    if (!isAvailable) {
      return res.status(400).json({ error: 'The selected date is not available for this venue. Please choose an available date.' })
    }
    // ─────────────────────────────────────────────────────────────────────────

    const booking = await prisma.booking.create({
      data: {
        venueId: parseInt(venueId),
        organizerId: parseInt(organizerId),
        eventDate: new Date(eventDate),
        notes,
        eventType: eventType || null,
        attendeeCount: attendeeCount ? parseInt(attendeeCount) : null
      },
      include: { venue: true, organizer: { select: { name: true } } }
    })

    // Notify the venue owner of the new booking application
    await prisma.notification.create({
      data: {
        userId: booking.venue.ownerId,
        title: 'New Booking Application',
        message: `${booking.organizer.name} submitted a booking request for ${booking.venue.name} on ${booking.eventDate.toLocaleDateString('en-GB')}`,
        link: '/venue/bookings'
      }
    })

    res.status(201).json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['APPROVED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or DECLINED' })
    }

    const bookingId = parseInt(req.params.id)
    const target = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { venue: true }
    })
    if (!target) return res.status(404).json({ error: 'Booking not found' })

    if (status === 'APPROVED') {
      // Lock the slot: reject if another booking for the same venue+date is already approved
      const dayStart = new Date(target.eventDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const conflict = await prisma.booking.findFirst({
        where: {
          venueId: target.venueId,
          status: 'APPROVED',
          id: { not: bookingId },
          eventDate: { gte: dayStart, lt: dayEnd }
        }
      })
      if (conflict) {
        return res.status(409).json({ error: 'This date is already locked by another approved booking for this venue.' })
      }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status, decidedAt: new Date() }
    })

    // Notify the organizer of the decision
    await prisma.notification.create({
      data: {
        userId: booking.organizerId,
        title: status === 'APPROVED' ? 'Booking Approved' : 'Booking Declined',
        message: `Your booking request for ${target.venue.name} on ${target.eventDate.toLocaleDateString('en-GB')} was ${status.toLowerCase()}.`,
        link: '/organizer/bookings'
      }
    })

    // If approved, the slot is now locked — auto-decline other pending requests for the same venue+date
    if (status === 'APPROVED') {
      const dayStart = new Date(target.eventDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const competing = await prisma.booking.findMany({
        where: {
          venueId: target.venueId,
          status: 'PENDING',
          id: { not: bookingId },
          eventDate: { gte: dayStart, lt: dayEnd }
        }
      })

      for (const c of competing) {
        await prisma.booking.update({ where: { id: c.id }, data: { status: 'DECLINED', decidedAt: new Date() } })
        await prisma.notification.create({
          data: {
            userId: c.organizerId,
            title: 'Booking Declined',
            message: `Your booking request for ${target.venue.name} on ${target.eventDate.toLocaleDateString('en-GB')} was declined because the date was booked by another organizer.`,
            link: '/organizer/bookings'
          }
        })
      }
    }

    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
}

module.exports = { getAllBookings, createBooking, updateBookingStatus }