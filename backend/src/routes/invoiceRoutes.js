const express = require('express')
const router = express.Router()
const { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController')
router.get('/', getAllInvoices)
router.get('/:id', getInvoiceById)
router.post('/', createInvoice)
router.patch('/:id/status', updateInvoiceStatus)
module.exports = router