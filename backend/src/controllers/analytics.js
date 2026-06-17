const prisma = require('../lib/prismaClient')

const getVenueAnalytics = async (req, res) => {
  try {
    const { ownerId } = req.params

    // Get all venues for this owner
    const venues = await prisma.venue.findMany({
      where: { ownerId: parseInt(ownerId) },
      include: { bookings: true }
    })

    // Get all bookings across all owner venues
    const venueIds = venues.map(v => v.id)
    const bookings = await prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      include: { venue: true }
    })

    // Calculate metrics
    const totalBookings = bookings.length
    const approvedBookings = bookings.filter(b => b.status === 'APPROVED').length
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
    const declinedBookings = bookings.filter(b => b.status === 'DECLINED').length
    const conversionRate = totalBookings > 0 ? ((approvedBookings / totalBookings) * 100).toFixed(1) : 0
    const estimatedRevenue = venues.reduce((sum, v) => {
      const approvedForVenue = v.bookings.filter(b => b.status === 'APPROVED').length
      return sum + (v.pricePerDay * approvedForVenue)
    }, 0)

    // Monthly breakdown
    const monthlyData = {}
    bookings.forEach(b => {
      const month = new Date(b.eventDate).toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) monthlyData[month] = { bookings: 0, revenue: 0, approved: 0 }
      monthlyData[month].bookings++
      if (b.status === 'APPROVED') {
        monthlyData[month].approved++
        monthlyData[month].revenue += b.venue?.pricePerDay || 0
      }
    })

    // Per venue breakdown
    const venueBreakdown = venues.map(v => ({
      id: v.id,
      name: v.name,
      city: v.city,
      pricePerDay: v.pricePerDay,
      totalBookings: v.bookings.length,
      approved: v.bookings.filter(b => b.status === 'APPROVED').length,
      pending: v.bookings.filter(b => b.status === 'PENDING').length,
      revenue: v.pricePerDay * v.bookings.filter(b => b.status === 'APPROVED').length
    }))

    res.json({
      summary: {
        totalVenues: venues.length,
        activeVenues: venues.filter(v => v.isActive).length,
        totalBookings,
        approvedBookings,
        pendingBookings,
        declinedBookings,
        conversionRate,
        estimatedRevenue
      },
      monthlyData,
      venueBreakdown
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}

module.exports = { getVenueAnalytics }