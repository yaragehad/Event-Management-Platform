require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log('🌱 Seeding database...')

  // ─── USERS ───────────────────────────────────────────────────────────────
  const organizer1 = await prisma.user.create({
    data: { name: 'Noran Mohamed', email: 'Noran@eventpro.com', password: 'hashed_password_1', role: 'ORGANIZER' }
  })
  const organizer2 = await prisma.user.create({
    data: { name: 'Omar Khalil', email: 'omar@eventpro.com', password: 'hashed_password_2', role: 'ORGANIZER' }
  })
  const staff1 = await prisma.user.create({
    data: { name: 'Ahmed Hassan', email: 'ahmed@staff.com', password: 'hashed_password_3', role: 'STAFF' }
  })
  const staff2 = await prisma.user.create({
    data: { name: 'Nour Sami', email: 'nour@staff.com', password: 'hashed_password_4', role: 'STAFF' }
  })
  const staff3 = await prisma.user.create({
    data: { name: 'Karim Youssef', email: 'karim@staff.com', password: 'hashed_password_5', role: 'STAFF' }
  })
  const vendorUser1 = await prisma.user.create({
    data: { name: 'Mona Catering', email: 'mona@catering.com', password: 'hashed_password_6', role: 'VENDOR' }
  })
  const vendorUser2 = await prisma.user.create({
    data: { name: 'Elite Decor', email: 'info@elitedecor.com', password: 'hashed_password_7', role: 'VENDOR' }
  })
  const vendorUser3 = await prisma.user.create({
    data: { name: 'Sound & Light Co', email: 'contact@soundlight.com', password: 'hashed_password_8', role: 'VENDOR' }
  })
  const guestUser1 = await prisma.user.create({
    data: { name: 'Layla Ibrahim', email: 'layla@gmail.com', password: 'hashed_password_9', role: 'GUEST' }
  })
  const guestUser2 = await prisma.user.create({
    data: { name: 'Tarek Mostafa', email: 'tarek@gmail.com', password: 'hashed_password_10', role: 'GUEST' }
  })
  const guestUser3 = await prisma.user.create({
    data: { name: 'Dina Fawzy', email: 'dina@gmail.com', password: 'hashed_password_11', role: 'GUEST' }
  })
  const guestUser4 = await prisma.user.create({
    data: { name: 'Youssef Adel', email: 'youssef@gmail.com', password: 'hashed_password_12', role: 'GUEST' }
  })
  const venueOwner1 = await prisma.user.create({
  data: { name: 'Yara Gehad', email: 'yara@venues.com', password: 'hashed_password_13', role: 'VENUE_OWNER' }
})
const venueOwner2 = await prisma.user.create({
  data: { name: 'Eissa Gehad', email: 'eissa@venues.com', password: 'hashed_password_14', role: 'VENUE_OWNER' }
})
const venueOwner3 = await prisma.user.create({
  data: { name: 'Dalia Eissa', email: 'dalia@venues.com', password: 'hashed_password_15', role: 'VENUE_OWNER' }
})

  console.log('✅ Users created')

  // ─── VENUES ──────────────────────────────────────────────────────────────
  const venue1 = await prisma.venue.create({
    data: {
      name: 'The Grand Hall',
      description: 'A spacious ballroom in the heart of Cairo',
      location: '15 Tahrir Square',
      city: 'Cairo',
      capacity: 500,
      areaM2: 800,
      amenities: 'Parking, WiFi, Kitchen, Stage, AV Equipment',
      pricePerDay: 5000,
      ownerId: venueOwner1.id
    }
  })
  const venue2 = await prisma.venue.create({
    data: {
      name: 'Nile View Terrace',
      description: 'Outdoor rooftop venue with Nile views',
      location: '8 Corniche El Nil',
      city: 'Cairo',
      capacity: 200,
      areaM2: 350,
      amenities: 'Outdoor Seating, WiFi, Bar, Lighting',
      pricePerDay: 3000,
      ownerId: venueOwner2.id
    }
  })
  const venue3 = await prisma.venue.create({
    data: {
      name: 'Alexandria Conference Center',
      description: 'Modern conference and event space',
      location: '22 Stanley Bridge Road',
      city: 'Alexandria',
      capacity: 300,
      areaM2: 500,
      amenities: 'Projectors, WiFi, Catering Area, Parking',
      pricePerDay: 4000,
      ownerId: venueOwner3.id
    }
  })

  console.log('✅ Venues created')

  // ─── BOOKINGS ────────────────────────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      venueId: venue1.id,
      organizerId: organizer1.id,
      eventDate: new Date('2026-07-15'),
      status: 'APPROVED'
    }
  })
  const booking2 = await prisma.booking.create({
    data: {
      venueId: venue2.id,
      organizerId: organizer1.id,
      eventDate: new Date('2026-08-20'),
      status: 'APPROVED'
    }
  })
  const booking3 = await prisma.booking.create({
    data: {
      venueId: venue3.id,
      organizerId: organizer2.id,
      eventDate: new Date('2026-09-10'),
      status: 'PENDING'
    }
  })

  console.log('✅ Bookings created')

  // ─── EVENTS ──────────────────────────────────────────────────────────────
  const event1 = await prisma.event.create({
    data: {
      name: 'Annual Tech Summit 2026',
      description: 'A large-scale technology conference bringing together industry leaders',
      date: new Date('2026-07-15'),
      organizerId: organizer1.id,
      bookingId: booking1.id,
      status: 'UPCOMING'
    }
  })
  const event2 = await prisma.event.create({
    data: {
      name: 'Summer Gala Dinner',
      description: 'An exclusive evening gala with live music and fine dining',
      date: new Date('2026-08-20'),
      organizerId: organizer1.id,
      bookingId: booking2.id,
      status: 'UPCOMING'
    }
  })
  const event3 = await prisma.event.create({
    data: {
      name: 'Product Launch: NovaTech X1',
      description: 'Official launch event for the new NovaTech product line',
      date: new Date('2026-09-10'),
      organizerId: organizer2.id,
      bookingId: booking3.id,
      status: 'UPCOMING'
    }
  })

  console.log('✅ Events created')

  // ─── STAFF ASSIGNMENTS ───────────────────────────────────────────────────
  const assign1 = await prisma.staffAssignment.create({
    data: { userId: staff1.id, eventId: event1.id, specialty: 'Logistics', employmentType: 'full-time' }
  })
  const assign2 = await prisma.staffAssignment.create({
    data: { userId: staff2.id, eventId: event1.id, specialty: 'Catering', employmentType: 'part-time' }
  })
  const assign3 = await prisma.staffAssignment.create({
    data: { userId: staff3.id, eventId: event2.id, specialty: 'Seating', employmentType: 'part-time' }
  })
  const assign4 = await prisma.staffAssignment.create({
    data: { userId: staff1.id, eventId: event2.id, specialty: 'Logistics', employmentType: 'full-time' }
  })

  console.log('✅ Staff assignments created')

  // ─── TASKS ───────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { eventId: event1.id, title: 'Set up registration desk', status: 'PENDING', dueDate: new Date('2026-07-14'), assigneeId: assign1.id },
      { eventId: event1.id, title: 'Arrange catering stations', status: 'IN_PROGRESS', dueDate: new Date('2026-07-14'), assigneeId: assign2.id },
      { eventId: event1.id, title: 'Test AV equipment', status: 'PENDING', dueDate: new Date('2026-07-14'), assigneeId: assign1.id },
      { eventId: event1.id, title: 'Coordinate speaker arrivals', status: 'PENDING', dueDate: new Date('2026-07-15') },
      { eventId: event2.id, title: 'Arrange table seating', status: 'PENDING', dueDate: new Date('2026-08-19'), assigneeId: assign3.id },
      { eventId: event2.id, title: 'Set up stage and lighting', status: 'IN_PROGRESS', dueDate: new Date('2026-08-19'), assigneeId: assign4.id },
      { eventId: event2.id, title: 'Confirm guest list with catering', status: 'DONE', dueDate: new Date('2026-08-15') },
      { eventId: event3.id, title: 'Prepare product demo area', status: 'PENDING', dueDate: new Date('2026-09-09') },
      { eventId: event3.id, title: 'Set up press registration', status: 'PENDING', dueDate: new Date('2026-09-09') },
    ]
  })

  console.log('✅ Tasks created')

  // ─── BUDGET ──────────────────────────────────────────────────────────────
  const budget1 = await prisma.budget.create({
    data: {
      eventId: event1.id,
      totalPlanned: 50000,
      items: {
        create: [
          { category: 'Catering', description: 'Food and beverages for 300 guests', plannedAmount: 15000 },
          { category: 'AV Equipment', description: 'Sound system and projectors', plannedAmount: 8000 },
          { category: 'Decoration', description: 'Stage and hall decoration', plannedAmount: 7000 },
          { category: 'Venue', description: 'Venue rental fee', plannedAmount: 5000 },
          { category: 'Marketing', description: 'Event promotion', plannedAmount: 5000 },
          { category: 'Miscellaneous', description: 'Other expenses', plannedAmount: 10000 },
        ]
      },
      expenses: {
        create: [
          { category: 'Catering', description: 'Deposit to Mona Catering', amount: 7500 },
          { category: 'AV Equipment', description: 'Sound & Light Co payment', amount: 8200 },
          { category: 'Venue', description: 'Venue booking payment', amount: 5000 },
        ]
      }
    }
  })

  const budget2 = await prisma.budget.create({
    data: {
      eventId: event2.id,
      totalPlanned: 30000,
      items: {
        create: [
          { category: 'Catering', description: 'Fine dining for 150 guests', plannedAmount: 12000 },
          { category: 'Decoration', description: 'Floral and table arrangements', plannedAmount: 6000 },
          { category: 'Entertainment', description: 'Live band', plannedAmount: 5000 },
          { category: 'Venue', description: 'Venue rental', plannedAmount: 3000 },
          { category: 'Miscellaneous', description: 'Other', plannedAmount: 4000 },
        ]
      },
      expenses: {
        create: [
          { category: 'Decoration', description: 'Elite Decor deposit', amount: 3000 },
          { category: 'Venue', description: 'Venue full payment', amount: 3000 },
        ]
      }
    }
  })

  console.log('✅ Budgets created')

  // ─── VENDORS ─────────────────────────────────────────────────────────────
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      companyName: 'Mona Catering Services',
      suppliesOffered: 'Full catering, buffet, beverages, waitstaff',
      location: 'Cairo, Egypt',
      contactEmail: 'mona@catering.com',
      contactPhone: '+20 100 123 4567'
    }
  })
  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      companyName: 'Elite Decor',
      suppliesOffered: 'Floral arrangements, table settings, stage decoration, lighting',
      location: 'Cairo, Egypt',
      contactEmail: 'info@elitedecor.com',
      contactPhone: '+20 101 987 6543'
    }
  })
  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      companyName: 'Sound & Light Co',
      suppliesOffered: 'PA systems, projectors, LED lighting, DJ equipment',
      location: 'Alexandria, Egypt',
      contactEmail: 'contact@soundlight.com',
      contactPhone: '+20 112 456 7890'
    }
  })

  console.log('✅ Vendors created')

  // ─── SOURCING REQUESTS ───────────────────────────────────────────────────
  const request1 = await prisma.sourcingRequest.create({
    data: {
      eventId: event1.id,
      vendorId: vendor1.id,
      items: 'Full buffet for 300 guests including vegetarian options',
      quantity: '300 meals',
      deliveryDate: new Date('2026-07-15'),
      status: 'ACCEPTED',
      notes: 'Please include gluten-free options'
    }
  })
  const request2 = await prisma.sourcingRequest.create({
    data: {
      eventId: event1.id,
      vendorId: vendor3.id,
      items: 'PA system, 2x projectors, stage lighting rig',
      quantity: '1 full setup',
      deliveryDate: new Date('2026-07-14'),
      status: 'ACCEPTED'
    }
  })
  const request3 = await prisma.sourcingRequest.create({
    data: {
      eventId: event2.id,
      vendorId: vendor2.id,
      items: 'Floral centerpieces for 20 tables, stage backdrop, entrance arch',
      quantity: '20 centerpieces + 1 arch',
      deliveryDate: new Date('2026-08-20'),
      status: 'ACCEPTED',
      notes: 'Color theme: white and gold'
    }
  })
  const request4 = await prisma.sourcingRequest.create({
    data: {
      eventId: event2.id,
      vendorId: vendor1.id,
      items: 'Fine dining 3-course meal for 150 guests',
      quantity: '150 meals',
      deliveryDate: new Date('2026-08-20'),
      status: 'PENDING'
    }
  })
  const request5 = await prisma.sourcingRequest.create({
    data: {
      eventId: event3.id,
      vendorId: vendor3.id,
      items: 'Wireless microphones x4, projector screen 16ft',
      quantity: '4 mics + 1 screen',
      deliveryDate: new Date('2026-09-10'),
      status: 'PENDING'
    }
  })

  console.log('✅ Sourcing requests created')

  // ─── DELIVERIES ──────────────────────────────────────────────────────────
  await prisma.delivery.create({
    data: { sourcingRequestId: request1.id, status: 'PREPARING' }
  })
  await prisma.delivery.create({
    data: { sourcingRequestId: request2.id, status: 'OUT_FOR_DELIVERY' }
  })
  await prisma.delivery.create({
    data: { sourcingRequestId: request3.id, status: 'PREPARING' }
  })

  console.log('✅ Deliveries created')

  // ─── INVOICES ────────────────────────────────────────────────────────────
  await prisma.invoice.createMany({
    data: [
      { vendorId: vendor1.id, amount: 15000, status: 'APPROVED', description: 'Full catering for Tech Summit 2026 - 300 guests' },
      { vendorId: vendor3.id, amount: 8200, status: 'PAID', description: 'AV equipment setup for Tech Summit 2026' },
      { vendorId: vendor2.id, amount: 6000, status: 'PENDING_REVIEW', description: 'Decoration services for Summer Gala Dinner' },
      { vendorId: vendor1.id, amount: 12000, status: 'PENDING_REVIEW', description: 'Fine dining catering for Summer Gala Dinner' },
    ]
  })

  console.log('✅ Invoices created')

  // ─── GUESTS ──────────────────────────────────────────────────────────────
  const guest1 = await prisma.guest.create({
    data: { userId: guestUser1.id, dietaryPreference: 'Vegetarian', checkInStatus: false }
  })
  const guest2 = await prisma.guest.create({
    data: { userId: guestUser2.id, dietaryPreference: 'No restrictions', checkInStatus: false }
  })
  const guest3 = await prisma.guest.create({
    data: { userId: guestUser3.id, dietaryPreference: 'Gluten-free', checkInStatus: false }
  })
  const guest4 = await prisma.guest.create({
    data: { userId: guestUser4.id, dietaryPreference: 'Vegan', checkInStatus: false }
  })

  // Link guests to events
  await prisma.event.update({ where: { id: event1.id }, data: { guests: { connect: [{ id: guest1.id }, { id: guest2.id }, { id: guest3.id }, { id: guest4.id }] } } })
  await prisma.event.update({ where: { id: event2.id }, data: { guests: { connect: [{ id: guest1.id }, { id: guest3.id }] } } })

  console.log('✅ Guests created')

  // ─── RSVPs ───────────────────────────────────────────────────────────────
  await prisma.rSVP.createMany({
    data: [
      { guestId: guest1.id, eventId: event1.id, status: 'ATTENDING' },
      { guestId: guest2.id, eventId: event1.id, status: 'ATTENDING' },
      { guestId: guest3.id, eventId: event1.id, status: 'MAYBE' },
      { guestId: guest4.id, eventId: event1.id, status: 'NOT_ATTENDING' },
      { guestId: guest1.id, eventId: event2.id, status: 'ATTENDING' },
      { guestId: guest3.id, eventId: event2.id, status: 'ATTENDING' },
    ]
  })

  console.log('✅ RSVPs created')

  // ─── FEEDBACK ────────────────────────────────────────────────────────────
  await prisma.feedback.createMany({
    data: [
      { eventId: event1.id, guestName: 'Layla Ibrahim', overall: 5, food: 5, venue: 4, organization: 5, comments: 'Absolutely amazing event! Everything was perfectly organized.' },
      { eventId: event1.id, guestName: 'Tarek Mostafa', overall: 4, food: 4, venue: 5, organization: 4, comments: 'Great venue and good food. Would attend again.' },
      { eventId: event1.id, guestName: 'Dina Fawzy', overall: 3, food: 3, venue: 4, organization: 3, comments: 'Decent event but registration was a bit slow.' },
    ]
  })

  console.log('✅ Feedback created')

  // ─── MESSAGES ────────────────────────────────────────────────────────────
  await prisma.message.createMany({
    data: [
      { eventId: event1.id, senderId: organizer1.id, content: 'Welcome to the Tech Summit! Please proceed to Hall A for registration.', seenByIds: [guestUser1.id, guestUser2.id] },
      { eventId: event1.id, senderId: organizer1.id, content: 'Reminder: Keynote speech starts in 30 minutes at the main stage.', seenByIds: [guestUser1.id] },
      { eventId: event2.id, senderId: organizer1.id, content: 'Welcome to the Summer Gala! Cocktail hour is on the terrace.', seenByIds: [guestUser1.id, guestUser3.id] },
    ]
  })

  console.log('✅ Messages created')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })