const nodemailer = require('nodemailer')
const prisma = require('../lib/prismaClient')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send invitation email to a guest (registers + links them, includes login credentials)
const sendInvitationEmail = async (req, res) => {
  try {
    const { guestEmail, guestName, eventId } = req.body

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { booking: { include: { venue: true } } },
    })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const cleanEmail = guestEmail.toLowerCase().trim()
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { guestProfile: true },
    })

    // Track the plain password ONLY for brand-new accounts (so we can email it)
    let plainPassword = null

    if (!user) {
      // friendly readable temp password e.g. "Gala-7421"
      plainPassword = `${event.name.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Event'}-${Math.floor(1000 + Math.random() * 9000)}`
      // hash it the same way auth/register does, so login's bcrypt.compare works
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(plainPassword, salt)
      user = await prisma.user.create({
        data: {
          name: guestName || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: hashedPassword,
          role: 'GUEST',
        },
        include: { guestProfile: true },
      })
    }

    let guest = user.guestProfile
    if (!guest) {
      guest = await prisma.guest.create({
        data: { userId: user.id, events: { connect: { id: event.id } } },
      })
    } else {
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: { events: { connect: { id: event.id } } },
      })
    }

    const loginLink = `http://localhost:3000/login`
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    // Credentials block — only shown for newly created accounts
    const credentialsBlock = plainPassword ? `
      <div style="background:#ffffff;border:1px solid #EDE0D9;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 12px;color:#2C1810;font-weight:bold;font-size:15px;">🔑 Your login details</p>
        <p style="margin:0 0 6px;color:#8B6555;font-size:14px;">Email: <strong style="color:#2C1810;">${cleanEmail}</strong></p>
        <p style="margin:0;color:#8B6555;font-size:14px;">Password: <strong style="color:#2C1810;">${plainPassword}</strong></p>
      </div>` : `
      <div style="background:#ffffff;border:1px solid #EDE0D9;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0;color:#8B6555;font-size:14px;">Log in with the account you already have to RSVP and manage your events.</p>
      </div>`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guestEmail,
      subject: `🎉 You're invited to ${event.name}!`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#FBF7F4;">
          <div style="background:linear-gradient(135deg,#6B2D0E 0%,#C4622D 100%);padding:44px 32px;text-align:center;">
            <p style="color:#F5EDE8;margin:0 0 8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">You're invited</p>
            <h1 style="color:#ffffff;margin:0;font-size:30px;">${event.name}</h1>
            <p style="color:#F5EDE8;margin:12px 0 0;font-size:15px;">📅 ${eventDate}</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#2C1810;margin:0 0 8px;">Hi ${guestName || 'there'}! 👋</h2>
            <p style="color:#8B6555;font-size:15px;line-height:1.6;margin:0 0 4px;">
              Get ready — you've been personally invited to <strong style="color:#2C1810;">${event.name}</strong>, and we can't wait to celebrate with you!
            </p>
            ${event.booking?.venue ? `<p style="color:#8B6555;font-size:15px;margin:8px 0 0;">📍 ${event.booking.venue.name}</p>` : ''}

            <a href="${loginLink}"
               style="display:block;margin:28px 0 8px;background:#C4622D;color:#ffffff;text-align:center;padding:16px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
              Log In &amp; RSVP →
            </a>

            ${credentialsBlock}

            <p style="color:#8B6555;font-size:14px;line-height:1.6;">
              Once you log in, you can RSVP, get your personal check-in QR pass, message the organizer, and share feedback — all in one place. ✨
            </p>

            <p style="color:#B89B8C;margin-top:24px;font-size:12px;">
              If the button doesn't work, copy this link: ${loginLink}
            </p>
          </div>
          <div style="background:#6B2D0E;padding:20px 32px;text-align:center;">
            <p style="color:#F5EDE8;margin:0;font-size:13px;">See you there! — The ${event.name} Team</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.json({ message: 'Invitation sent successfully!', guestId: guest.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send invitation email' })
  }
}

// Send invitations to all guests of an event
const sendInvitationsToAll = async (req, res) => {
  try {
    const { eventId } = req.body

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        guests: { include: { user: true } },
        booking: { include: { venue: true } },
      },
    })

    if (!event) return res.status(404).json({ error: 'Event not found' })

    let sentCount = 0

    for (const guest of event.guests) {
      const invitationLink = `http://localhost:3000/invitation/${eventId}?email=${encodeURIComponent(guest.user.email)}`
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guest.user.email,
        subject: `You're Invited to ${event.name}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #C4622D; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">You're Invited!</h1>
            </div>
            <div style="padding: 32px; background-color: #FBF7F4;">
              <h2 style="color: #2C1810;">Dear ${guest.user.name},</h2>
              <p style="color: #8B6555;">You have been invited to <strong>${event.name}</strong></p>
              <p style="color: #8B6555;">Date: <strong>${new Date(event.date).toLocaleDateString()}</strong></p>
              ${event.booking?.venue ? `<p style="color: #8B6555;">Venue: <strong>${event.booking.venue.name}</strong></p>` : ''}
              <a href="${invitationLink}" 
                 style="display: block; margin-top: 24px; background-color: #C4622D; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                View Invitation & RSVP
              </a>
            </div>
          </div>
        `,
      }
      await transporter.sendMail(mailOptions)
      sentCount++
    }

    res.json({ message: `Invitations sent to ${sentCount} guests!` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send invitations' })
  }
}

// Send RSVP confirmation email
const sendRSVPConfirmation = async (req, res) => {
  try {
    const { guestEmail, guestName, status, eventId, guestId } = req.body

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const statusText = status === 'ATTENDING' ? 'Attending' : status === 'NOT_ATTENDING' ? 'Not Attending' : 'Maybe'
    const statusColor = status === 'ATTENDING' ? '#2D7A4F' : status === 'NOT_ATTENDING' ? '#C0392B' : '#C4622D'

    const qrLink = `http://localhost:3000/my-qr/${eventId}?guestId=${guestId}`
    const qrButton = (status === 'ATTENDING' && guestId)
      ? `<a href="${qrLink}" style="display: block; margin-top: 16px; background-color: #2D7A4F; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">View My Check-In QR Code</a>
         <p style="color: #8B6555; margin-top: 12px; font-size: 13px;">Show this QR code to staff when you arrive at the event entrance.</p>`
      : ''

    const chatLink = `http://localhost:3000/guest-chat/${eventId}?guestId=${guestId}`
    const chatButton = (status === 'ATTENDING' && guestId)
      ? `<a href="${chatLink}" style="display: block; margin-top: 12px; background-color: #C4622D; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">Message the Organizer</a>`
      : ''

    const dashboardLink = `http://localhost:3000/guest-dashboard/${eventId}?guestId=${guestId}`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guestEmail,
      subject: `RSVP Confirmation — ${event.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #C4622D; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">RSVP Confirmed!</h1>
          </div>
          <div style="padding: 32px; background-color: #FBF7F4;">
            <h2 style="color: #2C1810;">Dear ${guestName},</h2>
            <p style="color: #8B6555;">Your RSVP for <strong>${event.name}</strong> has been recorded.</p>
            <div style="background-color: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #EDE0D9;">
              <p style="margin: 0; color: #8B6555;">Your status:</p>
              <p style="margin: 8px 0 0; font-size: 20px; font-weight: bold; color: ${statusColor};">${statusText}</p>
            </div>
            ${qrButton}
            ${chatButton}
            <a href="${dashboardLink}" style="display: block; margin-top: 16px; background-color: #6B2D0E; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to My Dashboard</a>
            <p style="color: #8B6555; margin-top: 16px; font-size: 13px;">If your plans change, you can update your RSVP anytime from your dashboard.</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.json({ message: 'RSVP confirmation sent!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send RSVP confirmation' })
  }
}

// Send check-in confirmation email
const sendCheckInConfirmation = async (req, res) => {
  try {
    const { guestEmail, guestName, eventId } = req.body
    if (!guestEmail) return res.status(400).json({ error: 'guestEmail is required' })

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: guestEmail,
      subject: `You're Checked In — ${event.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2D7A4F; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ You're Checked In!</h1>
          </div>
          <div style="padding: 32px; background-color: #FBF7F4;">
            <h2 style="color: #2C1810;">Welcome, ${guestName || 'Guest'}!</h2>
            <p style="color: #8B6555;">Your check-in for <strong>${event.name}</strong> has been confirmed. Enjoy the event!</p>
            <div style="background-color: #E8F5EE; border: 1px solid #2D7A4F; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #2D7A4F; font-weight: bold;">Check-in confirmed at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.json({ message: 'Check-in confirmation sent!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send check-in confirmation' })
  }
}

// Send feedback links to all CHECKED-IN guests of an event
const sendFeedbackLinks = async (req, res) => {
  try {
    const { eventId } = req.body
    const eId = parseInt(eventId)

    const event = await prisma.event.findUnique({ where: { id: eId } })
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: eId } }, checkInStatus: true },
      include: { user: { select: { name: true, email: true } } },
    })

    if (guests.length === 0) {
      return res.json({ message: 'No checked-in guests to send feedback to yet.', count: 0 })
    }

    let sentCount = 0
    for (const guest of guests) {
      const feedbackLink = `http://localhost:3000/feedback/${eId}?guestId=${guest.id}`
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guest.user.email,
        subject: `We'd love your feedback — ${event.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #C4622D; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">Thank You for Attending!</h1>
            </div>
            <div style="padding: 32px; background-color: #FBF7F4;">
              <h2 style="color: #2C1810;">Dear ${guest.user.name},</h2>
              <p style="color: #8B6555;">Thank you for attending <strong>${event.name}</strong>. We'd love to hear your thoughts!</p>
              <a href="${feedbackLink}"
                 style="display: block; margin-top: 24px; background-color: #C4622D; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Share Your Feedback
              </a>
              <p style="color: #8B6555; margin-top: 24px; font-size: 13px;">
                If the button doesn't work, copy this link: ${feedbackLink}
              </p>
            </div>
          </div>
        `,
      }
      await transporter.sendMail(mailOptions)
      sentCount++
    }

    res.json({ message: `Feedback link sent to ${sentCount} checked-in guest(s)!`, count: sentCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send feedback links' })
  }
}

// Notify all guests by email that the organizer broadcast a message (called from guestController)
const notifyBroadcast = async (eventId, content) => {
  try {
    const eId = parseInt(eventId)
    const event = await prisma.event.findUnique({ where: { id: eId } })
    if (!event) return
    const guests = await prisma.guest.findMany({
      where: { events: { some: { id: eId } } },
      include: { user: { select: { name: true, email: true } } },
    })
    for (const guest of guests) {
      const chatLink = `http://localhost:3000/guest-chat/${eId}?guestId=${guest.id}`
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: guest.user.email,
        subject: `New message from the organizer — ${event.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #C4622D; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Message</h1>
            </div>
            <div style="padding: 32px; background-color: #FBF7F4;">
              <h2 style="color: #2C1810;">Hi ${guest.user.name},</h2>
              <p style="color: #8B6555;">The organizer of <strong>${event.name}</strong> sent you a message:</p>
              <div style="background-color: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #EDE0D9;">
                <p style="margin: 0; color: #2C1810;">${content}</p>
              </div>
              <a href="${chatLink}" style="display: block; margin-top: 16px; background-color: #C4622D; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">View &amp; Reply</a>
            </div>
          </div>
        `,
      })
    }
  } catch (err) {
    console.error('BROADCAST EMAIL ERROR:', err)
  }
}

// Send a thank-you email after a guest submits feedback
const sendFeedbackThankYou = async (req, res) => {
  try {
    const { guestEmail, guestName, eventId } = req.body
    if (!guestEmail) return res.status(400).json({ error: 'guestEmail is required' })

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } })
    const eventName = event ? event.name : 'the event'

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: guestEmail,
      subject: `Thank you for your feedback — ${eventName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2D7A4F; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You!</h1>
          </div>
          <div style="padding: 32px; background-color: #FBF7F4;">
            <h2 style="color: #2C1810;">Dear ${guestName || 'Guest'},</h2>
            <p style="color: #8B6555;">Thank you for taking the time to share your feedback on <strong>${eventName}</strong>. Your input helps us make future events even better.</p>
            <div style="background-color: #E8F5EE; border: 1px solid #2D7A4F; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #2D7A4F; font-weight: bold;">Your feedback has been received.</p>
            </div>
          </div>
        </div>
      `,
    })
    res.json({ message: 'Thank-you email sent!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send thank-you email' })
  }
}

// Send login credentials to a newly created staff or vendor account
const sendCredentialsEmail = async (email, name, plainPassword, role) => {
  const roleLabel = role === 'STAFF' ? 'Staff Member' : 'Vendor'
  const loginLink = 'http://localhost:3000/login'
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome — your ${roleLabel.toLowerCase()} account is ready`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#FBF7F4;">
        <div style="background:linear-gradient(135deg,#6B2D0E 0%,#C4622D 100%);padding:44px 32px;text-align:center;">
          <p style="color:#F5EDE8;margin:0 0 8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Account Created</p>
          <h1 style="color:#ffffff;margin:0;font-size:30px;">Welcome, ${name}!</h1>
          <p style="color:#F5EDE8;margin:12px 0 0;font-size:15px;">${roleLabel}</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#2C1810;margin:0 0 8px;">Hi ${name}! 👋</h2>
          <p style="color:#8B6555;font-size:15px;line-height:1.6;margin:0 0 4px;">
            Your account has been created on the Event Management Platform. Use the details below to log in.
          </p>

          <a href="${loginLink}"
             style="display:block;margin:28px 0 8px;background:#C4622D;color:#ffffff;text-align:center;padding:16px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
            Log In Now →
          </a>

          <div style="background:#ffffff;border:1px solid #EDE0D9;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 12px;color:#2C1810;font-weight:bold;font-size:15px;">🔑 Your login details</p>
            <p style="margin:0 0 6px;color:#8B6555;font-size:14px;">Email: <strong style="color:#2C1810;">${email}</strong></p>
            <p style="margin:0;color:#8B6555;font-size:14px;">Password: <strong style="color:#2C1810;">${plainPassword}</strong></p>
          </div>

          <p style="color:#8B6555;font-size:14px;line-height:1.6;">
            We recommend changing your password after your first login. ✨
          </p>

          <p style="color:#B89B8C;margin-top:24px;font-size:12px;">
            If the button doesn't work, copy this link: ${loginLink}
          </p>
        </div>
        <div style="background:#6B2D0E;padding:20px 32px;text-align:center;">
          <p style="color:#F5EDE8;margin:0;font-size:13px;">This is an automated message — please do not reply.</p>
        </div>
      </div>
    `,
  })
}

module.exports = {
  sendInvitationEmail,
  sendInvitationsToAll,
  sendRSVPConfirmation,
  sendCheckInConfirmation,
  sendFeedbackLinks,
  notifyBroadcast,
  sendFeedbackThankYou,
  sendCredentialsEmail,
}