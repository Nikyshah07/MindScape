const express = require('express');
const router = express.Router();
const otpStore = require('./otpStore.js'); 

router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;  
    const emailEntry = Object.keys(otpStore).find(email => otpStore[email].otp === parseInt(otp));
  
    if (!emailEntry) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const { expires } = otpStore[emailEntry];
    
    if (Date.now() > expires) {
      delete otpStore[emailEntry]; 
      return res.status(400).json({ message: 'OTP has expired' });
    }

    
    res.status(200).json({ message: 'OTP verified successfully' });

   
});

module.exports = router;
