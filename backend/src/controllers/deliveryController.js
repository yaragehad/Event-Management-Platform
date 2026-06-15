const prisma = require('../lib/prismaClient')

// GET /api/deliveries - list all deliveries (filter by vendorId via sourcing request)
const getAllDeliveries = async (req, res) => {
  try {
    const { vendorId } = req.query
    const deliveries = await prisma.delivery.findMany({
      where: vendorId
        ? { sourcingRequest: { vendorId: parseInt(vendorId) } }
        : undefined,
      include: {
        sourcingRequest: {
          include: {
            vendor: { select: { companyName: true } },
            event: { select: { name: true, date: true } },
          },
        },
      },
    })
    res.json(deliveries)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deliveries' })
  }
}

// GET /api/deliveries/:id - get single delivery
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        sourcingRequest: {
          include: {
            vendor: true,
            event: { select: { name: true, date: true } },
          },
        },
      },
    })
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' })
    res.json(delivery)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery' })
  }
}

// PATCH /api/deliveries/:id/status - vendor updates delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }
    const delivery = await prisma.delivery.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    res.json(delivery)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status' })
  }
}

module.exports = { getAllDeliveries, getDeliveryById, updateDeliveryStatus }