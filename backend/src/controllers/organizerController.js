const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const { sendCredentialsEmail } = require('./emailController');

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
        user: { select: { id: true, name: true, email: true, isActive: true, age: true } },
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
        user: { select: { id: true, name: true, email: true, isActive: true } },
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

// PATCH /api/organizer/users/:userId/toggle-active
const toggleUserActive = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, role: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'ORGANIZER') {
      return res.status(403).json({ error: 'Cannot deactivate organizer accounts' });
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
};

// ── Account Management ────────────────────────────────────────────────────────
const createStakeholderAccount = async (req, res) => {
  try {
    const { name, email, password, role, age, specialty, employmentType, eventId,
      dietaryPreference, companyName, suppliesOffered, location, contactEmail, contactPhone } = req.body;

    // For staff/vendor, generate a readable temp password and email it; ignore any organizer-supplied one
    const rolePrefix = role === 'STAFF' ? 'Staff' : role === 'VENDOR' ? 'Vendor' : null;
    const plainPassword = rolePrefix
      ? `${rolePrefix}-${Math.floor(1000 + Math.random() * 9000)}`
      : password;

    const hashed = await bcrypt.hash(plainPassword, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role, age: age ? parseInt(age) : null } });

    if (role === 'STAFF' && eventId) {
      await prisma.staffAssignment.create({
        data: { userId: user.id, eventId: parseInt(eventId), specialty, employmentType }
      });
    } else if (role === 'GUEST') {
      await prisma.guest.create({ data: { userId: user.id, dietaryPreference } });
    } else if (role === 'VENDOR') {
      await prisma.vendor.create({
        data: { userId: user.id, companyName, suppliesOffered, location, contactEmail, contactPhone }
      });
    }

    // Email credentials to the new staff/vendor member (fire-and-forget; don't fail the request on email error)
    if (rolePrefix) {
      sendCredentialsEmail(email, name, plainPassword, role).catch(err =>
        console.error(`[createStakeholderAccount] credentials email failed for ${email}:`, err)
      );
    }

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const updateOrganizerProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id }, data,
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ── Budget CRUD ────────────────────────────────────────────────────────────────
const createOrUpdateBudget = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { totalPlanned } = req.body;
    const budget = await prisma.budget.upsert({
      where: { eventId },
      create: { eventId, totalPlanned: parseFloat(totalPlanned) },
      update: { totalPlanned: parseFloat(totalPlanned) },
      include: { items: true, expenses: true }
    });
    const totalActual = budget.expenses.reduce((s, e) => s + e.amount, 0);
    res.json({ ...budget, totalActual, difference: budget.totalPlanned - totalActual });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
};

const addBudgetItem = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { category, description, plannedAmount } = req.body;
    let budget = await prisma.budget.findUnique({ where: { eventId } });
    if (!budget) budget = await prisma.budget.create({ data: { eventId, totalPlanned: 0 } });
    const item = await prisma.budgetItem.create({
      data: { budgetId: budget.id, category, description, plannedAmount: parseFloat(plannedAmount) }
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add budget item' });
  }
};

const updateBudgetItem = async (req, res) => {
  try {
    const item = await prisma.budgetItem.update({
      where: { id: parseInt(req.params.itemId) },
      data: { ...req.body, plannedAmount: parseFloat(req.body.plannedAmount) }
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update budget item' });
  }
};

const deleteBudgetItem = async (req, res) => {
  try {
    await prisma.budgetItem.delete({ where: { id: parseInt(req.params.itemId) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete budget item' });
  }
};

const addExpense = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { category, description, amount, date } = req.body;
    let budget = await prisma.budget.findUnique({ where: { eventId } });
    if (!budget) budget = await prisma.budget.create({ data: { eventId, totalPlanned: 0 } });
    const expense = await prisma.expense.create({
      data: { budgetId: budget.id, category, description, amount: parseFloat(amount), date: date ? new Date(date) : new Date() }
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.expenseId) },
      data: { ...req.body, amount: parseFloat(req.body.amount), ...(req.body.date && { date: new Date(req.body.date) }) }
    });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.expenseId) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// ── Task Management ────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { eventId, title, description, dueDate, assigneeId } = req.body;
    const task = await prisma.task.create({
      data: {
        eventId: parseInt(eventId), title, description,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        status: 'PENDING'
      },
      include: {
        assignee: { include: { user: { select: { name: true } } } },
        event: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { assigneeId, status, title, dueDate } = req.body;
    const data = {};
    if (assigneeId !== undefined) data.assigneeId = assigneeId ? parseInt(assigneeId) : null;
    if (status) data.status = status;
    if (title) data.title = title;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    const task = await prisma.task.update({
      where: { id: taskId }, data,
      include: {
        assignee: { include: { user: { select: { name: true } } } },
        event: { select: { id: true, name: true } }
      }
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// ── Sourcing Requests ──────────────────────────────────────────────────────────
const getOrganizerSourcingRequests = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const events = await prisma.event.findMany({ where: { organizerId }, select: { id: true } });
    const eventIds = events.map(e => e.id);
    const requests = await prisma.sourcingRequest.findMany({
      where: eventIds.length > 0 ? { eventId: { in: eventIds } } : { id: -1 },
      include: {
        vendor: true,
        event: { select: { id: true, name: true, date: true } },
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sourcing requests' });
  }
};

const createSourcingRequest = async (req, res) => {
  try {
    const { eventId, vendorId, items, quantity, deliveryDate, notes } = req.body;
    const request = await prisma.sourcingRequest.create({
      data: {
        eventId: parseInt(eventId), vendorId: parseInt(vendorId),
        items, quantity, deliveryDate: new Date(deliveryDate), notes, status: 'PENDING'
      },
      include: {
        vendor: true,
        event: { select: { id: true, name: true } },
        delivery: true
      }
    });
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sourcing request' });
  }
};

// ── Invoices ───────────────────────────────────────────────────────────────────
const getOrganizerInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { vendor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(req.params.invoiceId) },
      data: { status: req.body.status },
      include: { vendor: true }
    });
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

// ── Day-Of Operations ──────────────────────────────────────────────────────────
const getDayOfDashboard = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const [event, guests, messages, tasks] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId },
        include: { booking: { include: { venue: true } } }
      }),
      prisma.guest.findMany({
        where: { events: { some: { id: eventId } } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          rsvps: { where: { eventId }, select: { status: true } }
        }
      }),
      prisma.message.findMany({ where: { eventId }, orderBy: { sentAt: 'desc' } }),
      prisma.task.findMany({
        where: { eventId },
        include: { assignee: { include: { user: { select: { name: true } } } } }
      })
    ]);
    const pendingTasksList = tasks.filter(t => t.status !== 'DONE');
    res.json({
      event, guests, messages,
      totalGuests: guests.length,
      checkedInGuests: guests.filter(g => g.checkInStatus).length,
      attendingGuests: guests.filter(g => g.rsvps?.[0]?.status === 'ATTENDING').length,
      totalTasks: tasks.length,
      tasksDone: tasks.filter(t => t.status === 'DONE').length,
      pendingTasksList,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch day-of dashboard' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { senderId, content } = req.body;
    const message = await prisma.message.create({
      data: { eventId, senderId: parseInt(senderId), content, seenByIds: [] }
    });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ── Task Reminders ─────────────────────────────────────────────────────────────
const sendTaskReminders = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
      where: {
        event: { organizerId },
        status: { not: 'DONE' },
        dueDate: { not: null, lte: tomorrow },
      },
      include: {
        event: { select: { name: true } },
        assignee: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (tasks.length === 0) {
      return res.json({ count: 0, message: 'No upcoming or overdue tasks found.' });
    }

    const notificationData = [];
    for (const task of tasks) {
      if (!task.assignee?.user) continue;
      const isOverdue = new Date(task.dueDate) < now;
      notificationData.push({
        userId: task.assignee.user.id,
        title: isOverdue ? `Overdue Task: ${task.title}` : `Task Due Soon: ${task.title}`,
        message: `${isOverdue ? 'OVERDUE' : 'Due tomorrow'}: "${task.title}" for event "${task.event.name}". Due: ${new Date(task.dueDate).toLocaleDateString()}.`,
      });
    }

    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < now);
    const dueSoonTasks = tasks.filter(t => new Date(t.dueDate) >= now);
    notificationData.push({
      userId: organizerId,
      title: 'Task Reminder Sent',
      message: `Reminders sent: ${overdueTasks.length} overdue and ${dueSoonTasks.length} due-soon tasks across your events.`,
    });

    const created = await prisma.notification.createMany({ data: notificationData });
    res.json({ count: created.count, message: `Sent ${created.count} reminder notifications.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
};

// ── Feedback & Reports ─────────────────────────────────────────────────────────
const getOrganizerFeedback = async (req, res) => {
  try {
    const organizerId = parseInt(req.params.id);
    const feedback = await prisma.feedback.findMany({
      where: { event: { organizerId } },
      include: { event: { select: { id: true, name: true, date: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

const getEventReport = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const [event, budget, guests, feedback, sourcingRequests] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId },
        include: { booking: { include: { venue: true } }, organizer: { select: { name: true } } }
      }),
      prisma.budget.findUnique({ where: { eventId }, include: { items: true, expenses: true } }),
      prisma.guest.findMany({
        where: { events: { some: { id: eventId } } },
        include: { user: { select: { name: true, email: true } }, rsvps: { where: { eventId }, select: { status: true } } }
      }),
      prisma.feedback.findMany({
        where: { eventId },
        select: { overall: true, food: true, venue: true, organization: true, comments: true, guestName: true }
      }),
      prisma.sourcingRequest.findMany({
        where: { eventId },
        include: { vendor: { select: { companyName: true } }, delivery: true }
      })
    ]);
    const totalActual = budget?.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
    const avgFeedback = feedback.length > 0
      ? (feedback.reduce((s, f) => s + f.overall, 0) / feedback.length).toFixed(1)
      : null;
    res.json({
      event, budget, guests, feedback, sourcingRequests,
      summary: {
        totalGuests: guests.length,
        totalAttending: guests.filter(g => g.rsvps?.[0]?.status === 'ATTENDING').length,
        totalArrived: guests.filter(g => g.checkInStatus).length,
        totalActual, totalPlanned: budget?.totalPlanned || 0,
        avgFeedback, totalFeedback: feedback.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
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
  toggleUserActive,
  // Account management
  createStakeholderAccount,
  updateOrganizerProfile,
  // Budget CRUD
  createOrUpdateBudget,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  addExpense,
  updateExpense,
  deleteExpense,
  // Task management
  createTask,
  updateTask,
  // Sourcing
  getOrganizerSourcingRequests,
  createSourcingRequest,
  // Invoices
  getOrganizerInvoices,
  updateInvoiceStatus,
  // Day-Of
  getDayOfDashboard,
  sendMessage,
  // Task Reminders
  sendTaskReminders,
  // Feedback & Reports
  getOrganizerFeedback,
  getEventReport,
};