const prisma = require('../lib/prismaClient')

// GET /api/sourcing-requests - list all requests (optionally filter by vendorId or eventId)
const getAllRequests = async (req, res) => {
  try {
    const { vendorId, eventId, status } = req.query
    const requests = await prisma.sourcingRequest.findMany({
      where: {
        ...(vendorId && { vendorId: parseInt(vendorId) }),
        ...(eventId && { eventId: parseInt(eventId) }),
        ...(status && { status }),
      },
      include: {
        vendor: { select: { companyName: true, contactEmail: true } },
        event: { select: { name: true, date: true } },
        delivery: true,
      },
    })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sourcing requests' })
  }
}

// GET /api/sourcing-requests/:id - get single request details
const getRequestById = async (req, res) => {
  try {
    const request = await prisma.sourcingRequest.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vendor: true,
        event: { select: { name: true, date: true, organizerId: true } },
        delivery: true,
      },
    })
    if (!request) return res.status(404).json({ error: 'Request not found' })
    res.json(request)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request' })
  }
}

// POST /api/sourcing-requests - organizer creates a sourcing request
const createRequest = async (req, res) => {
  try {
    const { eventId, vendorId, items, quantity, deliveryDate, notes } = req.body
    if (!eventId || !vendorId || !items || !deliveryDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const request = await prisma.sourcingRequest.create({
      data: {
        eventId: parseInt(eventId),
        vendorId: parseInt(vendorId),
        items,
        quantity,
        deliveryDate: new Date(deliveryDate),
        notes,
        status: 'PENDING',
      },
    })
    res.status(201).json(request)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sourcing request' })
  }
}

// PATCH /api/sourcing-requests/:id/status - vendor accepts or declines
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['ACCEPTED', 'DECLINED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }
    const request = await prisma.sourcingRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    // Auto-create a delivery record when vendor accepts
    if (status === 'ACCEPTED') {
      await prisma.delivery.upsert({
        where: { sourcingRequestId: request.id },
        update: {},
        create: { sourcingRequestId: request.id, status: 'PREPARING' },
      })
    }

    // Notify the event organizer of the vendor's decision
    const fullRequest = await prisma.sourcingRequest.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        event: { select: { organizerId: true, name: true } },
        vendor: { select: { companyName: true } },
      },
    })
    if (fullRequest?.event?.organizerId) {
      await prisma.notification.create({
        data: {
          userId: fullRequest.event.organizerId,
          title: `Sourcing Request ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
          message: `${fullRequest.vendor?.companyName} has ${status.toLowerCase()} your sourcing request for "${fullRequest.event.name}"`,
          link: '/organizer/dashboard',
        },
      })
    }

    res.json(request)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request status' })
  }
}

module.exports = { getAllRequests, getRequestById, createRequest, updateRequestStatus }