const prisma = require('../lib/prismaClient');

// GET /api/organizer/dashboard/:id
// Summary stats: today's events, task breakdown, avg feedback
const getDashboardSummary = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayEvents,
      upcomingEvents,
      allTasks,
      feedbacks,
      pendingBookings,
    ] = await Promise.all([
      prisma.event.count({
        where: {
          organizerId,
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.event.count({
        where: {
          organizerId,
          status: 'UPCOMING',
        },
      }),
      prisma.task.findMany({
        where: { event: { organizerId } },
        select: { status: true, dueDate: true },
      }),
      prisma.feedback.findMany({
        where: { event: { organizerId } },
        select: { overall: true },
      }),
      prisma.booking.count({
        where: { organizerId, status: 'PENDING' },
      }),
    ]);

    const pendingTasks = allTasks.filter((t) => t.status === 'PENDING').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const doneTasks = allTasks.filter((t) => t.status === 'DONE').length;

    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    ).length;

    const avgFeedback =
      feedbacks.length > 0
        ? (feedbacks.reduce((s, f) => s + f.overall, 0) / feedbacks.length).toFixed(1)
        : null;

    const positiveFeedback = feedbacks.filter((f) => f.overall >= 4).length;
    const negativeFeedback = feedbacks.filter((f) => f.overall <= 2).length;

    res.json({
      todayEvents,
      upcomingEvents,
      pendingTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      totalTasks: allTasks.length,
      avgFeedback,
      positiveFeedback,
      negativeFeedback,
      totalFeedback: feedbacks.length,
      pendingBookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

// GET /api/organizer/events/:id?status=&dateFrom=&dateTo=
const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const { status, dateFrom, dateTo } = req.query;

    const where = { organizerId };
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        booking: { include: { venue: true } },
        tasks: { select: { status: true } },
        _count: { select: { guests: true, feedbacks: true } },
      },
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// GET /api/organizer/tasks/:id?status=&eventId=
const getOrganizerTasks = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const { status, eventId } = req.query;

    const where = { event: { organizerId } };
    if (status) where.status = status;
    if (eventId) where.eventId = parseInt(eventId);

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      include: {
        event: { select: { id: true, name: true } },
        assignee: { include: { user: { select: { name: true } } } },
      },
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// GET /api/organizer/staff/:id?specialty=&employmentType=
const getOrganizerStaff = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const { specialty, employmentType } = req.query;

    const where = { event: { organizerId } };
    if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;

    const staff = await prisma.staffAssignment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        event: { select: { id: true, name: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

// GET /api/organizer/guests/:id?eventId=&rsvpStatus=&search=
const getOrganizerGuests = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const { eventId, rsvpStatus, search } = req.query;

    // Get events belonging to this organizer
    const events = await prisma.event.findMany({
      where: { organizerId },
      select: { id: true },
    });
    const eventIds = events.map((e) => e.id);

    const guestWhere = {
      events: { some: { id: { in: eventId ? [parseInt(eventId)] : eventIds } } },
    };
    if (search) {
      guestWhere.user = { name: { contains: search, mode: 'insensitive' } };
    }

    const guests = await prisma.guest.findMany({
      where: guestWhere,
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        rsvps: {
          where: { eventId: { in: eventId ? [parseInt(eventId)] : eventIds } },
          select: { status: true, eventId: true },
        },
        events: { select: { id: true, name: true } },
      },
    });

    // Filter by RSVP status if requested
    const filtered = rsvpStatus
      ? guests.filter((g) => g.rsvps.some((r) => r.status === rsvpStatus))
      : guests;

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
};

// GET /api/organizer/vendors?search=
const getVendors = async (req, res) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { suppliesOffered: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }
      : {};

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, isActive: true } },
        requests: {
          select: { status: true },
        },
        invoices: {
          select: { status: true, amount: true },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

// GET /api/organizer/budget/:eventId
const getEventBudget = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);

    const budget = await prisma.budget.findUnique({
      where: { eventId },
      include: {
        items: true,
        expenses: true,
        event: { select: { name: true, date: true } },
      },
    });

    if (!budget) return res.status(404).json({ error: 'No budget found for this event' });

    const totalActual = budget.expenses.reduce((s, e) => s + e.amount, 0);
    const totalPlanned = budget.totalPlanned;
    const difference = totalPlanned - totalActual;

    res.json({ ...budget, totalActual, difference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};

module.exports = {
  getDashboardSummary,
  getOrganizerEvents,
  getOrganizerTasks,
  getOrganizerStaff,
  getOrganizerGuests,
  getVendors,
  getEventBudget,
};
