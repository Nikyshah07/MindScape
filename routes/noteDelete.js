const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Note = require('../models/notes.js');
const User=require('../models/user.js')
router.delete('/note/:noteId', async (req, res) => {
    const { noteId } = req.params; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        const userId = decoded.userId;  

        
        const noteToDelete = await Note.findOne({ _id: noteId, user: userId });

        if (!noteToDelete) {
            return res.status(404).send({ success: false, message: 'Note not found or unauthorized' });
        }

        
        await Note.deleteOne({ _id: noteId });

        
        await User.updateOne(
            { _id: userId },
            { $pull: { notes: noteId } }
        );

        res.status(200).send({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error deleting note',
            error: error.message
        });
    }
});
module.exports=router;