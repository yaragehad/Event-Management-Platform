require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Clearing existing data...')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "DirectMessage", "Message", "RSVP", "Feedback", "Delivery", "SourcingRequest", "Invoice", "Layout", "BookingMessage", "Booking", "Task", "Budget", "BudgetItem", "Expense", "StaffAssignment", "Event", "Notification", "Guest", "Vendor", "Venue", "User" RESTART IDENTITY CASCADE`)
  console.log('✅ Database cleared')

  console.log('🌱 Seeding database...')
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('test12345', salt);

  // ─── USERS ───────────────────────────────────────────────────────────────
  const organizer0 = await prisma.user.create({
    data: { name: 'Ziad Bakry', email: 'ziad@eventpro.com', password: hashed, role: 'ORGANIZER' }
  })
  const organizer1 = await prisma.user.create({
    data: { name: 'Noran Mohamed', email: 'noran@eventpro.com', password: hashed, role: 'ORGANIZER' }
  })
  const organizer2 = await prisma.user.create({
    data: { name: 'Omar Khalil', email: 'omar@eventpro.com', password: hashed, role: 'ORGANIZER' }
  })

  // Staff for Noran
  const staff1 = await prisma.user.create({
    data: { name: 'Ahmed Hassan', email: 'ahmed@staff.com', password: hashed, role: 'STAFF' }
  })
  const staff2 = await prisma.user.create({
    data: { name: 'Nour Sami', email: 'nour.sami@staff.com', password: hashed, role: 'STAFF' }
  })
  const staff3 = await prisma.user.create({
    data: { name: 'Karim Youssef', email: 'karim@staff.com', password: hashed, role: 'STAFF' }
  })

  // Staff for Ziad
  const zStaff1 = await prisma.user.create({
    data: { name: 'Hannah Mitchell', email: 'hannah@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff2 = await prisma.user.create({
    data: { name: 'Nour Adel', email: 'nour.adel@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff3 = await prisma.user.create({
    data: { name: 'Dani Torres', email: 'dani@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff4 = await prisma.user.create({
    data: { name: 'Martin Fouad', email: 'martin@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff5 = await prisma.user.create({
    data: { name: 'Samaya Nasser', email: 'samaya@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff6 = await prisma.user.create({
    data: { name: 'Zeynab Ali', email: 'zeynab@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff7 = await prisma.user.create({
    data: { name: 'Ramy Khalid', email: 'ramy@staff.com', password: hashed, role: 'STAFF' }
  })
  const zStaff8 = await prisma.user.create({
    data: { name: 'Lara Mansour', email: 'lara@staff.com', password: hashed, role: 'STAFF' }
  })

  // Vendor users for Noran
  const vendorUser1 = await prisma.user.create({
    data: { name: 'Mona Catering', email: 'mona@catering.com', password: hashed, role: 'VENDOR' }
  })
  const vendorUser2 = await prisma.user.create({
    data: { name: 'Elite Decor', email: 'info@elitedecor.com', password: hashed, role: 'VENDOR' }
  })
  const vendorUser3 = await prisma.user.create({
    data: { name: 'Sound & Light Co', email: 'contact@soundlight.com', password: hashed, role: 'VENDOR' }
  })

  // Vendor users for Ziad
  const zVendorUser1 = await prisma.user.create({
    data: { name: 'FreshBite Catering', email: 'hello@freshbite.com', password: hashed, role: 'VENDOR' }
  })
  const zVendorUser2 = await prisma.user.create({
    data: { name: 'Bloom Events Decor', email: 'bloom@decor.com', password: hashed, role: 'VENDOR' }
  })
  const zVendorUser3 = await prisma.user.create({
    data: { name: 'ProAV Solutions', email: 'info@proav.com', password: hashed, role: 'VENDOR' }
  })

  // Guests for Noran
  const guestUser1 = await prisma.user.create({
    data: { name: 'Layla Ibrahim', email: 'layla@gmail.com', password: hashed, role: 'GUEST' }
  })
  const guestUser2 = await prisma.user.create({
    data: { name: 'Tarek Mostafa', email: 'tarek@gmail.com', password: hashed, role: 'GUEST' }
  })
  const guestUser3 = await prisma.user.create({
    data: { name: 'Dina Fawzy', email: 'dina@gmail.com', password: hashed, role: 'GUEST' }
  })
  const guestUser4 = await prisma.user.create({
    data: { name: 'Youssef Adel', email: 'youssef@gmail.com', password: hashed, role: 'GUEST' }
  })

  // Guests for Ziad
  const zGuestUser1 = await prisma.user.create({
    data: { name: 'Sara Ahmad', email: 'sara@gmail.com', password: hashed, role: 'GUEST' }
  })
  const zGuestUser2 = await prisma.user.create({
    data: { name: 'James Park', email: 'james@gmail.com', password: hashed, role: 'GUEST' }
  })
  const zGuestUser3 = await prisma.user.create({
    data: { name: 'Rania Hassan', email: 'rania@gmail.com', password: hashed, role: 'GUEST' }
  })
  const zGuestUser4 = await prisma.user.create({
    data: { name: 'Omar Saad', email: 'omarsaad@gmail.com', password: hashed, role: 'GUEST' }
  })

  // Venue owners
  const venueOwner1 = await prisma.user.create({
    data: { name: 'Yara Gehad', email: 'yara@venues.com', password: hashed, role: 'VENUE_OWNER' }
  })
  const venueOwner2 = await prisma.user.create({
    data: { name: 'Eissa Gehad', email: 'eissa@venues.com', password: hashed, role: 'VENUE_OWNER' }
  })
  const venueOwner3 = await prisma.user.create({
    data: { name: 'Dalia Eissa', email: 'dalia@venues.com', password: hashed, role: 'VENUE_OWNER' }
  })

  console.log('✅ Users created')

  // ─── VENUES ──────────────────────────────────────────────────────────────
  const venue1 = await prisma.venue.create({
    data: {
      name: 'The Grand Hall',
      description: 'A spacious ballroom in the heart of Cairo',
      location: '15 Tahrir Square', city: 'Cairo',
      capacity: 500, areaM2: 800,
      amenities: 'Parking, WiFi, Kitchen, Stage, AV Equipment',
      pricePerDay: 5000, ownerId: venueOwner1.id
    }
  })
  const venue2 = await prisma.venue.create({
    data: {
      name: 'Nile View Terrace',
      description: 'Outdoor rooftop venue with Nile views',
      location: '8 Corniche El Nil', city: 'Cairo',
      capacity: 200, areaM2: 350,
      amenities: 'Outdoor Seating, WiFi, Bar, Lighting',
      pricePerDay: 3000, ownerId: venueOwner1.id
    }
  })
  const venue3 = await prisma.venue.create({
    data: {
      name: 'Alexandria Conference Center',
      description: 'Modern conference and event space',
      location: '22 Stanley Bridge Road', city: 'Alexandria',
      capacity: 300, areaM2: 500,
      amenities: 'Projectors, WiFi, Catering Area, Parking',
      pricePerDay: 4000, ownerId: venueOwner3.id
    }
  })
  const venue4 = await prisma.venue.create({
    data: {
      name: 'Skyline Rooftop Lounge',
      description: 'Chic rooftop space perfect for corporate and social events',
      location: '5 Hassan Sabri St', city: 'Cairo',
      capacity: 150, areaM2: 280,
      amenities: 'Rooftop, Bar, WiFi, Lighting, Outdoor Heaters',
      pricePerDay: 3500, ownerId: venueOwner2.id
    }
  })

  console.log('✅ Venues created')

  // ─── BOOKINGS ────────────────────────────────────────────────────────────
  // Noran's bookings
  const booking1 = await prisma.booking.create({
    data: { venueId: venue1.id, organizerId: organizer1.id, eventDate: new Date('2026-07-15'), status: 'APPROVED' }
  })
  const booking2 = await prisma.booking.create({
    data: { venueId: venue2.id, organizerId: organizer1.id, eventDate: new Date('2026-08-20'), status: 'APPROVED' }
  })
  const booking3 = await prisma.booking.create({
    data: { venueId: venue3.id, organizerId: organizer2.id, eventDate: new Date('2026-09-10'), status: 'PENDING' }
  })

  // Ziad's bookings
  const zBooking1 = await prisma.booking.create({
    data: { venueId: venue1.id, organizerId: organizer0.id, eventDate: new Date('2026-10-05'), status: 'APPROVED' }
  })
  const zBooking2 = await prisma.booking.create({
    data: { venueId: venue4.id, organizerId: organizer0.id, eventDate: new Date('2026-11-22'), status: 'APPROVED' }
  })

  console.log('✅ Bookings created')

  // ─── EVENTS ──────────────────────────────────────────────────────────────
  // Noran's events
  const event1 = await prisma.event.create({
    data: { name: 'Annual Tech Summit 2026', description: 'A large-scale technology conference bringing together industry leaders', date: new Date('2026-07-15'), organizerId: organizer1.id, bookingId: booking1.id, status: 'UPCOMING' }
  })
  const event2 = await prisma.event.create({
    data: { name: 'Summer Gala Dinner', description: 'An exclusive evening gala with live music and fine dining', date: new Date('2026-08-20'), organizerId: organizer1.id, bookingId: booking2.id, status: 'UPCOMING' }
  })
  const event3 = await prisma.event.create({
    data: { name: 'Product Launch: NovaTech X1', description: 'Official launch event for the new NovaTech product line', date: new Date('2026-09-10'), organizerId: organizer2.id, bookingId: booking3.id, status: 'UPCOMING' }
  })

  // Ziad's events
  const zEvent1 = await prisma.event.create({
    data: { name: 'Design Week Cairo 2026', description: 'A four-day creative design conference showcasing regional talent and global trends', date: new Date('2026-10-05'), organizerId: organizer0.id, bookingId: zBooking1.id, status: 'UPCOMING' }
  })
  const zEvent2 = await prisma.event.create({
    data: { name: 'Founders Networking Night', description: 'An intimate evening connecting startup founders, investors, and mentors', date: new Date('2026-11-22'), organizerId: organizer0.id, bookingId: zBooking2.id, status: 'UPCOMING' }
  })

  console.log('✅ Events created')

  // ─── STAFF ASSIGNMENTS ───────────────────────────────────────────────────
  // Noran's staff
  const assign1 = await prisma.staffAssignment.create({ data: { userId: staff1.id, eventId: event1.id, specialty: 'Logistics', employmentType: 'full-time' } })
  const assign2 = await prisma.staffAssignment.create({ data: { userId: staff2.id, eventId: event1.id, specialty: 'Catering', employmentType: 'part-time' } })
  const assign3 = await prisma.staffAssignment.create({ data: { userId: staff3.id, eventId: event2.id, specialty: 'Seating', employmentType: 'part-time' } })
  const assign4 = await prisma.staffAssignment.create({ data: { userId: staff1.id, eventId: event2.id, specialty: 'Logistics', employmentType: 'full-time' } })

  // Ziad's staff assignments
  const zA1 = await prisma.staffAssignment.create({ data: { userId: zStaff1.id, eventId: zEvent1.id, specialty: 'Coordination', employmentType: 'full-time' } })
  const zA2 = await prisma.staffAssignment.create({ data: { userId: zStaff2.id, eventId: zEvent1.id, specialty: 'Catering', employmentType: 'part-time' } })
  const zA3 = await prisma.staffAssignment.create({ data: { userId: zStaff3.id, eventId: zEvent1.id, specialty: 'Logistics', employmentType: 'full-time' } })
  const zA4 = await prisma.staffAssignment.create({ data: { userId: zStaff4.id, eventId: zEvent1.id, specialty: 'AV & Tech', employmentType: 'part-time' } })
  const zA5 = await prisma.staffAssignment.create({ data: { userId: zStaff5.id, eventId: zEvent2.id, specialty: 'Guest Relations', employmentType: 'full-time' } })
  const zA6 = await prisma.staffAssignment.create({ data: { userId: zStaff6.id, eventId: zEvent2.id, specialty: 'Seating', employmentType: 'part-time' } })
  const zA7 = await prisma.staffAssignment.create({ data: { userId: zStaff7.id, eventId: zEvent2.id, specialty: 'Security', employmentType: 'part-time' } })
  const zA8 = await prisma.staffAssignment.create({ data: { userId: zStaff8.id, eventId: zEvent2.id, specialty: 'Photography', employmentType: 'full-time' } })

  console.log('✅ Staff assignments created')

  // ─── TASKS ───────────────────────────────────────────────────────────────
  // Noran's tasks
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

  // Ziad's tasks
  await prisma.task.createMany({
    data: [
      { eventId: zEvent1.id, title: 'Confirm speaker lineup', status: 'DONE', dueDate: new Date('2026-09-20'), assigneeId: zA1.id },
      { eventId: zEvent1.id, title: 'Set up exhibition booths', status: 'IN_PROGRESS', dueDate: new Date('2026-10-04'), assigneeId: zA3.id },
      { eventId: zEvent1.id, title: 'Prepare catering stations', status: 'PENDING', dueDate: new Date('2026-10-04'), assigneeId: zA2.id },
      { eventId: zEvent1.id, title: 'Test stage AV systems', status: 'PENDING', dueDate: new Date('2026-10-04'), assigneeId: zA4.id },
      { eventId: zEvent1.id, title: 'Brief all staff members', status: 'PENDING', dueDate: new Date('2026-10-05'), assigneeId: zA1.id },
      { eventId: zEvent2.id, title: 'Prepare welcome packs', status: 'IN_PROGRESS', dueDate: new Date('2026-11-21'), assigneeId: zA5.id },
      { eventId: zEvent2.id, title: 'Arrange seating plan', status: 'PENDING', dueDate: new Date('2026-11-21'), assigneeId: zA6.id },
      { eventId: zEvent2.id, title: 'Coordinate security briefing', status: 'PENDING', dueDate: new Date('2026-11-21'), assigneeId: zA7.id },
      { eventId: zEvent2.id, title: 'Set up photo station', status: 'PENDING', dueDate: new Date('2026-11-22'), assigneeId: zA8.id },
    ]
  })

  console.log('✅ Tasks created')

  // ─── BUDGET ──────────────────────────────────────────────────────────────
  // Noran's budgets
  await prisma.budget.create({
    data: {
      eventId: event1.id, totalPlanned: 50000,
      items: { create: [
        { category: 'Catering', description: 'Food and beverages for 300 guests', plannedAmount: 15000 },
        { category: 'AV Equipment', description: 'Sound system and projectors', plannedAmount: 8000 },
        { category: 'Decoration', description: 'Stage and hall decoration', plannedAmount: 7000 },
        { category: 'Venue', description: 'Venue rental fee', plannedAmount: 5000 },
        { category: 'Marketing', description: 'Event promotion', plannedAmount: 5000 },
        { category: 'Miscellaneous', description: 'Other expenses', plannedAmount: 10000 },
      ]},
      expenses: { create: [
        { category: 'Catering', description: 'Deposit to Mona Catering', amount: 7500 },
        { category: 'AV Equipment', description: 'Sound & Light Co payment', amount: 8200 },
        { category: 'Venue', description: 'Venue booking payment', amount: 5000 },
      ]}
    }
  })
  await prisma.budget.create({
    data: {
      eventId: event2.id, totalPlanned: 30000,
      items: { create: [
        { category: 'Catering', description: 'Fine dining for 150 guests', plannedAmount: 12000 },
        { category: 'Decoration', description: 'Floral and table arrangements', plannedAmount: 6000 },
        { category: 'Entertainment', description: 'Live band', plannedAmount: 5000 },
        { category: 'Venue', description: 'Venue rental', plannedAmount: 3000 },
        { category: 'Miscellaneous', description: 'Other', plannedAmount: 4000 },
      ]},
      expenses: { create: [
        { category: 'Decoration', description: 'Elite Decor deposit', amount: 3000 },
        { category: 'Venue', description: 'Venue full payment', amount: 3000 },
      ]}
    }
  })

  // Ziad's budgets
  await prisma.budget.create({
    data: {
      eventId: zEvent1.id, totalPlanned: 75000,
      items: { create: [
        { category: 'Catering', description: 'Coffee breaks and lunch for 250 attendees', plannedAmount: 20000 },
        { category: 'AV & Stage', description: 'Screens, mics, lighting rig', plannedAmount: 15000 },
        { category: 'Decoration', description: 'Branded booths and signage', plannedAmount: 12000 },
        { category: 'Venue', description: 'Grand Hall rental', plannedAmount: 5000 },
        { category: 'Marketing', description: 'Social media and print', plannedAmount: 8000 },
        { category: 'Speakers', description: 'Speaker honorariums and travel', plannedAmount: 10000 },
        { category: 'Miscellaneous', description: 'Contingency', plannedAmount: 5000 },
      ]},
      expenses: { create: [
        { category: 'Venue', description: 'Grand Hall booking deposit', amount: 5000 },
        { category: 'Catering', description: 'FreshBite advance payment', amount: 8000 },
        { category: 'Marketing', description: 'Ad campaigns and print run', amount: 6500 },
      ]}
    }
  })
  await prisma.budget.create({
    data: {
      eventId: zEvent2.id, totalPlanned: 25000,
      items: { create: [
        { category: 'Catering', description: 'Cocktails and canapes for 100 guests', plannedAmount: 9000 },
        { category: 'Decoration', description: 'Floral and ambient lighting', plannedAmount: 4000 },
        { category: 'Venue', description: 'Skyline Rooftop rental', plannedAmount: 3500 },
        { category: 'Entertainment', description: 'Acoustic duo', plannedAmount: 4000 },
        { category: 'Miscellaneous', description: 'Welcome gifts and printing', plannedAmount: 4500 },
      ]},
      expenses: { create: [
        { category: 'Venue', description: 'Skyline Rooftop deposit', amount: 3500 },
        { category: 'Decoration', description: 'Bloom Decor deposit', amount: 2000 },
      ]}
    }
  })

  console.log('✅ Budgets created')

  // ─── VENDORS ─────────────────────────────────────────────────────────────
  // Noran's vendors
  const vendor1 = await prisma.vendor.create({ data: { userId: vendorUser1.id, companyName: 'Mona Catering Services', suppliesOffered: 'Full catering, buffet, beverages, waitstaff', location: 'Cairo, Egypt', contactEmail: 'mona@catering.com', contactPhone: '+20 100 123 4567' } })
  const vendor2 = await prisma.vendor.create({ data: { userId: vendorUser2.id, companyName: 'Elite Decor', suppliesOffered: 'Floral arrangements, table settings, stage decoration, lighting', location: 'Cairo, Egypt', contactEmail: 'info@elitedecor.com', contactPhone: '+20 101 987 6543' } })
  const vendor3 = await prisma.vendor.create({ data: { userId: vendorUser3.id, companyName: 'Sound & Light Co', suppliesOffered: 'PA systems, projectors, LED lighting, DJ equipment', location: 'Alexandria, Egypt', contactEmail: 'contact@soundlight.com', contactPhone: '+20 112 456 7890' } })

  // Ziad's vendors
  const zVendor1 = await prisma.vendor.create({ data: { userId: zVendorUser1.id, companyName: 'FreshBite Catering', suppliesOffered: 'Gourmet catering, coffee stations, cocktail catering', location: 'Cairo, Egypt', contactEmail: 'hello@freshbite.com', contactPhone: '+20 100 555 1234' } })
  const zVendor2 = await prisma.vendor.create({ data: { userId: zVendorUser2.id, companyName: 'Bloom Events Decor', suppliesOffered: 'Floral design, branded setups, ambient lighting, entrance arches', location: 'Cairo, Egypt', contactEmail: 'bloom@decor.com', contactPhone: '+20 111 222 3344' } })
  const zVendor3 = await prisma.vendor.create({ data: { userId: zVendorUser3.id, companyName: 'ProAV Solutions', suppliesOffered: 'LED screens, wireless mics, live streaming, stage lighting', location: 'Cairo, Egypt', contactEmail: 'info@proav.com', contactPhone: '+20 122 777 8899' } })

  console.log('✅ Vendors created')

  // ─── SOURCING REQUESTS ───────────────────────────────────────────────────
  // Noran's requests
  const request1 = await prisma.sourcingRequest.create({ data: { eventId: event1.id, vendorId: vendor1.id, items: 'Full buffet for 300 guests including vegetarian options', quantity: '300 meals', deliveryDate: new Date('2026-07-15'), status: 'ACCEPTED', notes: 'Please include gluten-free options' } })
  const request2 = await prisma.sourcingRequest.create({ data: { eventId: event1.id, vendorId: vendor3.id, items: 'PA system, 2x projectors, stage lighting rig', quantity: '1 full setup', deliveryDate: new Date('2026-07-14'), status: 'ACCEPTED' } })
  const request3 = await prisma.sourcingRequest.create({ data: { eventId: event2.id, vendorId: vendor2.id, items: 'Floral centerpieces for 20 tables, stage backdrop, entrance arch', quantity: '20 centerpieces + 1 arch', deliveryDate: new Date('2026-08-20'), status: 'ACCEPTED', notes: 'Color theme: white and gold' } })
  const request4 = await prisma.sourcingRequest.create({ data: { eventId: event2.id, vendorId: vendor1.id, items: 'Fine dining 3-course meal for 150 guests', quantity: '150 meals', deliveryDate: new Date('2026-08-20'), status: 'PENDING' } })

  // Ziad's sourcing requests
  const zRequest1 = await prisma.sourcingRequest.create({ data: { eventId: zEvent1.id, vendorId: zVendor1.id, items: 'Coffee breaks (AM & PM) + lunch buffet for 250 attendees', quantity: '250 pax x 2 days', deliveryDate: new Date('2026-10-05'), status: 'ACCEPTED', notes: 'Include vegan and gluten-free options' } })
  const zRequest2 = await prisma.sourcingRequest.create({ data: { eventId: zEvent1.id, vendorId: zVendor3.id, items: 'LED stage screen 20ft, 6x wireless mics, full lighting rig', quantity: '1 full setup', deliveryDate: new Date('2026-10-04'), status: 'ACCEPTED' } })
  const zRequest3 = await prisma.sourcingRequest.create({ data: { eventId: zEvent1.id, vendorId: zVendor2.id, items: 'Branded exhibition booths x10, directional signage, entrance arch', quantity: '10 booths + signage', deliveryDate: new Date('2026-10-04'), status: 'PENDING', notes: 'Brand colors: navy and orange' } })
  const zRequest4 = await prisma.sourcingRequest.create({ data: { eventId: zEvent2.id, vendorId: zVendor1.id, items: 'Cocktail catering with canapes for 100 guests', quantity: '100 pax', deliveryDate: new Date('2026-11-22'), status: 'ACCEPTED' } })
  const zRequest5 = await prisma.sourcingRequest.create({ data: { eventId: zEvent2.id, vendorId: zVendor2.id, items: 'Ambient floral decor, entrance arch, table centerpieces', quantity: '10 tables + arch', deliveryDate: new Date('2026-11-22'), status: 'ACCEPTED', notes: 'Color theme: deep green and gold' } })

  console.log('✅ Sourcing requests created')

  // ─── DELIVERIES ──────────────────────────────────────────────────────────
  await prisma.delivery.create({ data: { sourcingRequestId: request1.id, status: 'PREPARING' } })
  await prisma.delivery.create({ data: { sourcingRequestId: request2.id, status: 'OUT_FOR_DELIVERY' } })
  await prisma.delivery.create({ data: { sourcingRequestId: request3.id, status: 'PREPARING' } })
  await prisma.delivery.create({ data: { sourcingRequestId: zRequest1.id, status: 'PREPARING' } })
  await prisma.delivery.create({ data: { sourcingRequestId: zRequest2.id, status: 'PREPARING' } })
  await prisma.delivery.create({ data: { sourcingRequestId: zRequest4.id, status: 'PREPARING' } })
  await prisma.delivery.create({ data: { sourcingRequestId: zRequest5.id, status: 'PREPARING' } })

  console.log('✅ Deliveries created')

  // ─── INVOICES ────────────────────────────────────────────────────────────
  await prisma.invoice.createMany({
    data: [
      // Noran's invoices
      { vendorId: vendor1.id, amount: 15000, status: 'APPROVED', description: 'Full catering for Tech Summit 2026 - 300 guests' },
      { vendorId: vendor3.id, amount: 8200, status: 'PAID', description: 'AV equipment setup for Tech Summit 2026' },
      { vendorId: vendor2.id, amount: 6000, status: 'PENDING_REVIEW', description: 'Decoration services for Summer Gala Dinner' },
      { vendorId: vendor1.id, amount: 12000, status: 'PENDING_REVIEW', description: 'Fine dining catering for Summer Gala Dinner' },
      // Ziad's invoices
      { vendorId: zVendor1.id, amount: 20000, status: 'PENDING_REVIEW', description: 'Catering services for Design Week Cairo 2026' },
      { vendorId: zVendor3.id, amount: 15000, status: 'APPROVED', description: 'AV & stage setup for Design Week Cairo 2026' },
      { vendorId: zVendor1.id, amount: 9000, status: 'PENDING_REVIEW', description: 'Cocktail catering for Founders Networking Night' },
      { vendorId: zVendor2.id, amount: 4000, status: 'PENDING_REVIEW', description: 'Decor for Founders Networking Night' },
    ]
  })

  console.log('✅ Invoices created')

  // ─── GUESTS ──────────────────────────────────────────────────────────────
  // Noran's guests
  const guest1 = await prisma.guest.create({ data: { userId: guestUser1.id, dietaryPreference: 'Vegetarian', checkInStatus: false } })
  const guest2 = await prisma.guest.create({ data: { userId: guestUser2.id, dietaryPreference: 'No restrictions', checkInStatus: false } })
  const guest3 = await prisma.guest.create({ data: { userId: guestUser3.id, dietaryPreference: 'Gluten-free', checkInStatus: false } })
  const guest4 = await prisma.guest.create({ data: { userId: guestUser4.id, dietaryPreference: 'Vegan', checkInStatus: false } })

  await prisma.event.update({ where: { id: event1.id }, data: { guests: { connect: [{ id: guest1.id }, { id: guest2.id }, { id: guest3.id }, { id: guest4.id }] } } })
  await prisma.event.update({ where: { id: event2.id }, data: { guests: { connect: [{ id: guest1.id }, { id: guest3.id }] } } })

  // Ziad's guests
  const zGuest1 = await prisma.guest.create({ data: { userId: zGuestUser1.id, dietaryPreference: 'Vegetarian', checkInStatus: false } })
  const zGuest2 = await prisma.guest.create({ data: { userId: zGuestUser2.id, dietaryPreference: 'No restrictions', checkInStatus: false } })
  const zGuest3 = await prisma.guest.create({ data: { userId: zGuestUser3.id, dietaryPreference: 'Halal', checkInStatus: false } })
  const zGuest4 = await prisma.guest.create({ data: { userId: zGuestUser4.id, dietaryPreference: 'No restrictions', checkInStatus: false } })

  await prisma.event.update({ where: { id: zEvent1.id }, data: { guests: { connect: [{ id: zGuest1.id }, { id: zGuest2.id }, { id: zGuest3.id }, { id: zGuest4.id }] } } })
  await prisma.event.update({ where: { id: zEvent2.id }, data: { guests: { connect: [{ id: zGuest1.id }, { id: zGuest3.id }, { id: zGuest4.id }] } } })

  console.log('✅ Guests created')

  // ─── RSVPs ───────────────────────────────────────────────────────────────
  await prisma.rSVP.createMany({
    data: [
      // Noran's RSVPs
      { guestId: guest1.id, eventId: event1.id, status: 'ATTENDING' },
      { guestId: guest2.id, eventId: event1.id, status: 'ATTENDING' },
      { guestId: guest3.id, eventId: event1.id, status: 'MAYBE' },
      { guestId: guest4.id, eventId: event1.id, status: 'NOT_ATTENDING' },
      { guestId: guest1.id, eventId: event2.id, status: 'ATTENDING' },
      { guestId: guest3.id, eventId: event2.id, status: 'ATTENDING' },
      // Ziad's RSVPs
      { guestId: zGuest1.id, eventId: zEvent1.id, status: 'ATTENDING' },
      { guestId: zGuest2.id, eventId: zEvent1.id, status: 'ATTENDING' },
      { guestId: zGuest3.id, eventId: zEvent1.id, status: 'MAYBE' },
      { guestId: zGuest4.id, eventId: zEvent1.id, status: 'ATTENDING' },
      { guestId: zGuest1.id, eventId: zEvent2.id, status: 'ATTENDING' },
      { guestId: zGuest3.id, eventId: zEvent2.id, status: 'ATTENDING' },
      { guestId: zGuest4.id, eventId: zEvent2.id, status: 'MAYBE' },
    ]
  })

  console.log('✅ RSVPs created')

  // ─── FEEDBACK ────────────────────────────────────────────────────────────
  await prisma.feedback.createMany({
    data: [
      // Noran's feedback
      { eventId: event1.id, guestName: 'Layla Ibrahim', overall: 5, food: 5, venue: 4, organization: 5, comments: 'Absolutely amazing event! Everything was perfectly organized.' },
      { eventId: event1.id, guestName: 'Tarek Mostafa', overall: 4, food: 4, venue: 5, organization: 4, comments: 'Great venue and good food. Would attend again.' },
      { eventId: event1.id, guestName: 'Dina Fawzy', overall: 3, food: 3, venue: 4, organization: 3, comments: 'Decent event but registration was a bit slow.' },
      // Ziad's feedback (from a past event)
      { eventId: zEvent1.id, guestName: 'Sara Ahmad', overall: 5, food: 4, venue: 5, organization: 5, comments: 'One of the best design events I have attended. Incredible speakers!' },
      { eventId: zEvent1.id, guestName: 'James Park', overall: 4, food: 5, venue: 4, organization: 4, comments: 'Great networking opportunities. The catering was top notch.' },
      { eventId: zEvent1.id, guestName: 'Rania Hassan', overall: 4, food: 3, venue: 5, organization: 4, comments: 'Loved the venue and the sessions. Food could be improved.' },
    ]
  })

  console.log('✅ Feedback created')

  // ─── MESSAGES ────────────────────────────────────────────────────────────
  // Noran's messages
  await prisma.message.create({ data: { eventId: event1.id, guestId: guest1.id, senderRole: 'ORGANIZER', content: 'Welcome to the Tech Summit! Please proceed to Hall A for registration.', seenByGuest: true } })
  await prisma.message.create({ data: { eventId: event1.id, guestId: guest2.id, senderRole: 'ORGANIZER', content: 'Welcome to the Tech Summit! Please proceed to Hall A for registration.', seenByGuest: true } })
  await prisma.message.create({ data: { eventId: event1.id, guestId: guest1.id, senderRole: 'ORGANIZER', content: 'Reminder: Keynote speech starts in 30 minutes at the main stage.', seenByGuest: true } })

  // Ziad's guest messages
  await prisma.message.create({ data: { eventId: zEvent1.id, guestId: zGuest1.id, senderRole: 'ORGANIZER', content: 'Welcome to Design Week Cairo! Pick up your badge at the entrance.', seenByGuest: true } })
  await prisma.message.create({ data: { eventId: zEvent1.id, guestId: zGuest2.id, senderRole: 'ORGANIZER', content: 'Welcome to Design Week Cairo! Pick up your badge at the entrance.', seenByGuest: false } })
  await prisma.message.create({ data: { eventId: zEvent1.id, guestId: zGuest1.id, senderRole: 'GUEST', content: 'Thank you! Where is the main stage?', seenByOrganizer: false } })

  console.log('✅ Messages created')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('─── Login credentials (all passwords: test12345) ───')
  console.log('Organizer (Ziad):   ziad@eventpro.com')
  console.log('Organizer (Noran):  noran@eventpro.com')
  console.log('Staff (Hannah):     hannah@staff.com')
  console.log('Staff (Nour):       nour.adel@staff.com')
  console.log('Staff (Dani):       dani@staff.com')
  console.log('Staff (Martin):     martin@staff.com')
  console.log('Staff (Samaya):     samaya@staff.com')
  console.log('Staff (Zeynab):     zeynab@staff.com')
  console.log('Vendor (FreshBite): hello@freshbite.com')
  console.log('Vendor (Bloom):     bloom@decor.com')
  console.log('Vendor (ProAV):     info@proav.com')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
