const express = require('express');
const router = express.Router();
const prisma = require('../lib/prismaClient');

// GET /api/staff/events/:userId
router.get('/events/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const assignments = await prisma.staffAssignment.findMany({
      where: { userId },
      include: { event: true }
    });
    const events = assignments.map(a => ({
      id: a.event.id,
      name: a.event.name,
      date: a.event.date,
      location: a.event.description,
      role: a.specialty,
      status: a.event.status
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/staff/tasks/:userId
router.get('/tasks/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const assignments = await prisma.staffAssignment.findMany({
      where: { userId },
      include: {
        tasks: {
          include: { event: true }
        }
      }
    });
    const tasks = assignments.flatMap(a =>
      a.tasks.map(t => ({
        id: t.id,
        title: t.title,
        event: t.event.name,
        status: t.status,
        category: a.specialty,
        dueDate: t.dueDate
      }))
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/staff/tasks/:userId/reminders
router.get('/tasks/:userId/reminders', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const assignments = await prisma.staffAssignment.findMany({
      where: { userId },
      include: {
        tasks: {
          where: { status: { not: 'DONE' } },
          include: { event: true },
          orderBy: { dueDate: 'asc' }
        }
      }
    });
    const reminders = assignments.flatMap(a =>
      a.tasks.map(t => ({
        id: t.id,
        title: t.title,
        event: t.event.name,
        status: t.status,
        dueDate: t.dueDate,
        category: a.specialty
      }))
    );
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// PATCH /api/staff/tasks/:taskId/status - Update task status
router.patch('/tasks/:taskId/status', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// GET /api/staff/guests/:eventId
router.get('/guests/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: {
          include: {
            user: true,
            rsvps: { where: { eventId } }
          }
        }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const guests = event.guests.map(g => ({
      id: g.id,
      name: g.user.name,
      event: event.name,
      rsvp: g.rsvps[0]?.status || 'PENDING',
      checkedIn: g.checkInStatus
    }));
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// GET /api/staff/guests/:guestId/details
router.get('/guests/:guestId/details', async (req, res) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        user: true,
        rsvps: { include: { event: true } },
        events: true
      }
    });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json({
      id: guest.id,
      name: guest.user.name,
      email: guest.user.email,
      dietaryPreference: guest.dietaryPreference,
      checkedIn: guest.checkInStatus,
      rsvps: guest.rsvps.map(r => ({
        event: r.event.name,
        status: r.status
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guest details' });
  }
});

// PATCH /api/staff/guests/:guestId/checkin
router.patch('/guests/:guestId/checkin', async (req, res) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const { checkedIn } = req.body;
    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: { checkInStatus: checkedIn }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update check-in status' });
  }
});

// GET /api/staff/vendors/:eventId
router.get('/vendors/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const requests = await prisma.sourcingRequest.findMany({
      where: { eventId },
      include: {
        vendor: true,
        delivery: true,
        event: true
      }
    });
    const vendors = requests.map(r => ({
      id: r.vendor.id,
      requestId: r.id,
      name: r.vendor.companyName,
      supplies: r.items,
      event: r.event.name,
      arrived: r.delivery?.status === 'DELIVERED'
    }));
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// PATCH /api/staff/vendors/:requestId/arrived
router.patch('/vendors/:requestId/arrived', async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const { arrived } = req.body;
    const delivery = await prisma.delivery.upsert({
      where: { sourcingRequestId: requestId },
      update: { status: arrived ? 'DELIVERED' : 'PREPARING' },
      create: { sourcingRequestId: requestId, status: arrived ? 'DELIVERED' : 'PREPARING' }
    });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vendor arrival' });
  }
});

// GET /api/staff/dayof/:eventId
router.get('/dayof/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        guests: true,
        vendorRequests: {
          include: { delivery: true }
        }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const totalGuests = event.guests.length;
    const arrivedGuests = event.guests.filter(g => g.checkInStatus).length;
    const totalVendors = event.vendorRequests.length;
    const arrivedVendors = event.vendorRequests.filter(r => r.delivery?.status === 'DELIVERED').length;
    res.json({
      eventName: event.name,
      date: event.date,
      status: event.status,
      totalGuests,
      arrivedGuests,
      totalVendors,
      arrivedVendors
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day-of data' });
  }
});

module.exports = router;
