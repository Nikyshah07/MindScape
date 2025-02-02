const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params; // Get userId from route parameters

    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    // Validate input (check if token is provided)
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    try {
        // Verify the token (if needed for authentication purposes)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authenticatedUserId = decoded.userId; // Get the ID of the authenticated user (if needed)

        // You can check if the authenticated user has permission to view this profile (optional)
        // For example, you can check if the authenticated user is an admin, or if they are the same as `userId`

        // Find the user by the provided userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const formattedBirthDate = user.birthDate.toLocaleDateString('en-GB'); 
        // Return the user profile details (excluding sensitive fields like password)
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                birthDate: formattedBirthDate,
                male: user.male,
                female: user.female
            }
        });

    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile retrieval',
            error: error.message
        });
    }
});

module.exports = router;
