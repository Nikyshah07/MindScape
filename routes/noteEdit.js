const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Note = require('../models/notes.js');


router.put('/note/:noteId', async (req, res) => {
    const { noteId } = req.params; 
    const { title, note, mood } = req.body; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const userId = decoded.userId;  

        
        const noteToUpdate = await Note.findOne({ _id: noteId, user: userId });

        if (!noteToUpdate) {
            return res.status(404).send({ success: false, message: 'Note not found or unauthorized' });
        }

        
        noteToUpdate.title = title || noteToUpdate.title;
        noteToUpdate.note = note || noteToUpdate.note;
        noteToUpdate.mood = mood || noteToUpdate.mood;

        
        await noteToUpdate.save();

        
        res.status(200).send({
            success: true,
            message: 'Note updated successfully',
            note: noteToUpdate
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating note',
            error: error.message
        });
    }
});

module.exports = router;

