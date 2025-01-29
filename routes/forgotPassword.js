// forgotPassword.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const nodemailer = require('nodemailer');
const otpStore = require('./otpStore.js'); 

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
     try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email not found' });
      }
  
      const otp = Math.floor(1000 + Math.random() * 9000);  
      const expirationTime = Date.now() + 5 * 60 * 1000; 
      
      
      otpStore[email] = { otp, expires: expirationTime };  
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,  
          pass: process.env.PASSWORD, 
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for Password Reset',
        text: `Your OTP is ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          
          return res.status(500).json({ message: 'Failed to send OTP' });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
      });
    } catch (error) {
      
      res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
