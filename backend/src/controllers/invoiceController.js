const prisma = require('../lib/prismaClient')

// GET /api/invoices - list all invoices (filter by vendorId or status)
const getAllInvoices = async (req, res) => {
  try {
    const { vendorId, status } = req.query
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(vendorId && { vendorId: parseInt(vendorId) }),
        ...(status && { status }),
      },
      include: {
        vendor: { select: { companyName: true, contactEmail: true } },
      },
    })
    res.json(invoices)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
}

// GET /api/invoices/:id - get single invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { vendor: true },
    })
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' })
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
}

// POST /api/invoices - vendor submits an invoice
const createInvoice = async (req, res) => {
  try {
    const { vendorId, amount, description } = req.body
    if (!vendorId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const invoice = await prisma.invoice.create({
      data: {
        vendorId: parseInt(vendorId),
        amount: parseFloat(amount),
        description,
        status: 'PENDING_REVIEW',
      },
    })
    res.status(201).json(invoice)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice' })
  }
}

// PATCH /api/invoices/:id/status - organizer updates invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!['PENDING_REVIEW', 'APPROVED', 'PAID'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice status' })
  }
}

module.exports = { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus }