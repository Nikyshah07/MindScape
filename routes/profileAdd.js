const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/profileadd', async (req, res) => {
    const { name, birthDate, gender } = req.body;
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    // Validate input
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!name || !birthDate || !gender) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Parse birthDate from DD-MM-YYYY format
        const [day, month, year] = birthDate.split('-').map(Number);
        const dateOfBirth = new Date(year, month - 1, day); // Month is zero-based

       
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        
        user.name = name;
        user.birthDate = dateOfBirth;
        user.gender = gender;

        
        await user.save();
        const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB'); 
        res.status(200).json({
            success: true,
            message: 'Profile Added successfully',
            user: {
                id: user._id,
                name: user.name,
                birthDate: formattedBirthDate,
                gender: user.gender,
                email: user.email 
            }
        });

    } catch (error) {
       
        res.status(500).json({
            success: false,
            message: 'Server error during profile add',
            error: error.message
        });
    }
});



module.exports=router;
