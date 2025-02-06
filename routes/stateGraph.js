const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/notes.js');
const User = require('../models/user.js');

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.sendStatus(403); // Forbidden if no token is provided
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Attach user info to request
        next();
    });
};

// Handle mood data retrieval for a user
router.get('/mood-data/:id', authenticateJWT, async (req, res) => {
    const { startDate, endDate } = req.query; // Expecting startDate and endDate
    const userId = req.params.id;

    console.log(`Received startDate: ${startDate}`);
    console.log(`Received endDate: ${endDate}`);

    try {
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Fetch notes for the user within the specified date range
        const notes = await Note.find({
            user: userId,
            createdAt: { $gte: start, $lte: end }
        }).select('mood createdAt');

        if (notes.length === 0) {
            console.log('No mood data found for this user in the specified date range.');
            return res.status(200).json([]);  // Return an empty array if no data is found
        }

        // Process notes to group by day of the week and count moods
        const moodData = {};
        notes.forEach(note => {
            const dayOfWeek = note.createdAt.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"
            if (!moodData[dayOfWeek]) {
                moodData[dayOfWeek] = {};
            }
            if (!moodData[dayOfWeek][note.mood]) {
                moodData[dayOfWeek][note.mood] = 0;
            }
            moodData[dayOfWeek][note.mood]++; // Increment mood count for the day
        });

        // Define all mood names that the frontend expects
        const allMoods = ["Awesome", "Noiicee", "Meh", "Angy", "Sed", "Awful", "Lazy Lad", "Sick"];
        // Ensure all days of the week are present, even with no data
        const allDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        allDaysOfWeek.forEach(day => {
            if (!moodData[day]) {
                moodData[day] = {}; // Ensure each day has an entry
            }
            // Add any missing moods with a count of 0
            allMoods.forEach(mood => {
                if (!moodData[day][mood]) {
                    moodData[day][mood] = 0;
                }
            });
        });

        // Convert the processed data into a chart-friendly format
        const chartData = allDaysOfWeek.map(day => {
            const moodCounts = moodData[day];
            return {
                day: day,
                moodCounts: allMoods.reduce((acc, mood) => {
                    acc[mood] = moodCounts[mood]; // Ensure each mood has a count for that day
                    return acc;
                }, {})
            };
        });

        console.log("Chart Data (before sending):", chartData);

        res.json(chartData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

