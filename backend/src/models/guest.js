const prisma = require('../lib/prismaClient')

// Get all guests
const getAllGuests = async () => {
  return prisma.guest.findMany({
    include: {
      user: { select: { name: true, email: true } },
      rsvps: true,
      events: true,
    },
  })
}

// Get guest by ID
const getGuestById = async (id) => {
  return prisma.guest.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      rsvps: true,
      events: true,
    },
  })
}

// Update guest check-in status
const updateCheckInStatus = async (id) => {
  return prisma.guest.update({
    where: { id },
    data: { checkInStatus: true },
  })
}

// Update dietary preference
const updateDietaryPreference = async (id, dietaryPreference) => {
  return prisma.guest.update({
    where: { id },
    data: { dietaryPreference },
  })
}

// Get all RSVPs for a guest
const getGuestRSVPs = async (guestId) => {
  return prisma.rSVP.findMany({
    where: { guestId },
  })
}

// Create RSVP
const createRSVP = async (guestId, eventId, status) => {
  return prisma.rSVP.create({
    data: { guestId, eventId, status },
  })
}

// Update RSVP
const updateRSVP = async (id, status) => {
  return prisma.rSVP.update({
    where: { id },
    data: { status },
  })
}

// Create feedback
const createFeedback = async (eventId, guestName, overall, food, venue, organization, comments) => {
  return prisma.feedback.create({
    data: { eventId, guestName, overall, food, venue, organization, comments },
  })
}

// Get feedback for event
const getFeedbackByEvent = async (eventId) => {
  return prisma.feedback.findMany({
    where: { eventId },
  })
}

// Create message
const createMessage = async (eventId, senderId, content) => {
  return prisma.message.create({
    data: { eventId, senderId, content },
  })
}

// Get messages for event
const getMessagesByEvent = async (eventId) => {
  return prisma.message.findMany({
    where: { eventId },
  })
}

// Mark message as seen
const markMessageSeen = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  })
  const updatedSeenByIds = [...new Set([...message.seenByIds, userId])]
  return prisma.message.update({
    where: { id: messageId },
    data: { seenByIds: updatedSeenByIds },
  })
}

// Get day-of dashboard data
const getDashboardData = async (eventId) => {
  const totalGuests = await prisma.guest.count({
    where: { events: { some: { id: eventId } } },
  })
  const arrivedGuests = await prisma.guest.count({
    where: {
      events: { some: { id: eventId } },
      checkInStatus: true,
    },
  })
  return { totalGuests, arrivedGuests }
}

module.exports = {
  getAllGuests,
  getGuestById,
  updateCheckInStatus,
  updateDietaryPreference,
  getGuestRSVPs,
  createRSVP,
  updateRSVP,
  createFeedback,
  getFeedbackByEvent,
  createMessage,
  getMessagesByEvent,
  markMessageSeen,
  getDashboardData,
}