const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.put('/profile/:userId',async (req,res)=>{
    const {name,birthDate,gender}=req.body;
    
    const token=req.headers["authorization"] && req.headers["authorization"].split(' ')[1];
    if (!token) {
        return res.status(400).send({ success: false, message: 'Authorization token is missing' });
    }
    try{
         const decoded = jwt.verify(token, process.env.JWT_SECRET);  
         const userId = decoded.userId;  

         const profileToUpdate = await User.findById(userId);

         if (!profileToUpdate) {
            return res.status(404).send({ success: false, message: 'Profile not found or unauthorized' });
        }

        const [day, month, year] = birthDate.split('-').map(Number);
        const dateOfBirth = new Date(year, month - 1, day)


        profileToUpdate.name = name || profileToUpdate.name
        profileToUpdate.birthDate = dateOfBirth|| profileToUpdate.dateOfBirth
        profileToUpdate.gender = gender || profileToUpdate.gender 

        
        await profileToUpdate.save();

        const formattedBirthDate = profileToUpdate.birthDate.toLocaleDateString('en-GB'); 
        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                id: profileToUpdate._id,
                name: profileToUpdate.name,
                birthDate: formattedBirthDate,
                gender: profileToUpdate.gender,
                email: profileToUpdate.email 
            }
            
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating Profile',
            error: error.message
        });
    }
})
module.exports=router;