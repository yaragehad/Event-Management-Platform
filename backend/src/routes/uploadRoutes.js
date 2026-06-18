const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6)
    cb(null, unique + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|pdf/
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
  cb(null, allowed.test(ext))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })

// POST /api/upload/photos — multiple photos
router.post('/photos', upload.array('photos', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

// POST /api/upload/documents — layout documents (PDF or image)
router.post('/documents', upload.array('documents', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

module.exports = router
