const prisma = require('../lib/prismaClient')

// GET /api/vendors - list all vendors with optional search
const getAllVendors = async (req, res) => {
  try {
    const { search } = req.query
    const vendors = await prisma.vendor.findMany({
      where: search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { suppliesOffered: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { user: { select: { name: true, email: true } } },
    })
    res.json(vendors)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' })
  }
}

// GET /api/vendors/:id - get single vendor details
const getVendorById = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { name: true, email: true } },
        requests: { include: { event: { select: { name: true, date: true } } } },
        invoices: true,
      },
    })
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' })
    res.json(vendor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendor' })
  }
}

// POST /api/vendors - create a new vendor profile
const createVendor = async (req, res) => {
  try {
    const { userId, companyName, suppliesOffered, location, contactEmail, contactPhone } = req.body
    if (!userId || !companyName || !suppliesOffered || !location || !contactEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const vendor = await prisma.vendor.create({
      data: { userId, companyName, suppliesOffered, location, contactEmail, contactPhone },
    })
    res.status(201).json(vendor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vendor' })
  }
}

// PUT /api/vendors/:id - update vendor profile
const updateVendor = async (req, res) => {
  try {
    const { companyName, suppliesOffered, location, contactEmail, contactPhone } = req.body
    const vendor = await prisma.vendor.update({
      where: { id: parseInt(req.params.id) },
      data: { companyName, suppliesOffered, location, contactEmail, contactPhone },
    })
    res.json(vendor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vendor' })
  }
}

module.exports = { getAllVendors, getVendorById, createVendor, updateVendor }