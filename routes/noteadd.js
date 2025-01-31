const express=require('express');
const User=require('../models/user.js')
const jwt=require('jsonwebtoken')
const router=express.Router()
const Note=require('../models/notes.js')

router.post('/noteadd', async (req, res) => {
    const { title, note, mood } = req.body;
    const token = req.headers['authorization'].split(' ')[1];  // Token from Authorization header

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const userId = decoded.userId; 

        
        const newNote = new Note({
            title,
            note,
            mood,
            user: userId  
        });

        await newNote.save();  

        
        await User.findByIdAndUpdate(userId, { $push: { notes: newNote._id } });

        res.status(201).send({ success: true, message: 'Note added successfully', noteId: newNote._id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error adding note', error: error.message });
    }
});



module.exports=router