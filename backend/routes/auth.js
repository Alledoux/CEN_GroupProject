const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const protect = require("../middleware/auth");
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if(user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const pass = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, pass);

    user = new User({
      username,
      email,
      password : hashedPassword
    });
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Welcome to TaskTracker!',
      text: `Thanks for registering with TaskTracker.`,
      html: `<p>Hi <strong>${username}</strong>, welcome aboard! 🎉</p><p>We're excited to help you stay productive.</p>`
    });

    res.status(201).send('User registered and email sent');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Registration failed');
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
module.exports = router;