const prisma = require('../lib/prismaClient')

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

const createInvoice = async (req, res) => {
  try {
    const { vendorId, amount, description, documentName, documentData } = req.body
    if (!vendorId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const invoice = await prisma.invoice.create({
      data: {
        vendorId: parseInt(vendorId),
        amount: parseFloat(amount),
        description,
        status: 'PENDING_REVIEW',
        documentName: documentName || null,
        documentData: documentData || null,
      },
    })

    // Notify all organizers about the new invoice
    const vendorInfo = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) },
      select: { companyName: true },
    })
    const organizers = await prisma.user.findMany({
      where: { role: 'ORGANIZER', isActive: true },
      select: { id: true },
    })
    if (organizers.length > 0) {
      await prisma.notification.createMany({
        data: organizers.map(org => ({
          userId: org.id,
          title: 'New Invoice Submitted',
          message: `${vendorInfo?.companyName || 'A vendor'} submitted an invoice for $${parseFloat(amount)}`,
          link: '/organizer/invoices',
        })),
      })
    }

    res.status(201).json(invoice)
  } catch (err) {
    console.error('Full error:', err)
    res.status(500).json({ error: 'Failed to create invoice', details: err.message, code: err.code })
  }
}

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

    // Notify the vendor that their invoice status changed
    const fullInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { vendor: { include: { user: { select: { id: true } } } } },
    })
    if (fullInvoice?.vendor?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: fullInvoice.vendor.user.id,
          title: 'Invoice Status Updated',
          message: `Your invoice #${req.params.id} has been ${status.replace('_', ' ')}`,
          link: '/vendor/invoices',
        },
      })
    }

    res.json(invoice)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice status' })
  }
}

module.exports = { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus }