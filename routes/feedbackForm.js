const express = require('express');
const Feedback = require('../models/feedback.js');
const router = express.Router();
const jwt=require("jsonwebtoken")


router.post('/feedback/:userId',async (req,res) => {
    const {name,feedBack,mood}=req.body;
    const {userId}=req.params;
    const token=req.headers["authorization"] && req.headers["authorization"].split(' ')[1];
    
    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }
     if ( !name || !feedBack ||!mood) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    const userId = decoded.userId;  
        const newFeedback=new Feedback({
            name,
            feedBack,
            mood,
            user:userId
        })

        await newFeedback.save();
        
        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
})

module.exports = router;