const express=require('express');
const User = require('../models/user.js');
const nodemailer = require('nodemailer');
const router=express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(401).json({ success: false, message: "User does not exist." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ success: false, message: "Incorrect password." });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ success: true, message: "Login successful!", token, user });
  } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error. Please try again later." });
  }
});

  

module.exports = router;