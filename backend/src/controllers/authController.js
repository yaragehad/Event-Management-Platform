const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prismaClient')

// 1. REGISTER (Public Door)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Security Check: Only allow primary accounts to self-register
    const allowedPublicRoles = ['ORGANIZER', 'VENUE_OWNER'];
    const assignedRole = allowedPublicRoles.includes(role) ? role : 'ORGANIZER';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      }
    });

    res.status(201).json({
        message: "Account created successfully",
        userId: newUser.id,
        role: newUser.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare the entered password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate the JWT Token (The Digital VIP Pass)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    let vendorId = null;
    if (user.role === 'VENDOR') {
      const vendorProfile = await prisma.vendor.findUnique({ where: { userId: user.id } });
      vendorId = vendorProfile?.id ?? null;
    }

    res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, vendorId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};