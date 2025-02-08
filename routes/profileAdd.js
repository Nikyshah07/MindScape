const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser=require('body-parser')
const cors=require('cors')
const multer=require('multer')
const app=express()
const path = require('path');
app.use(bodyParser.urlencoded({extended:true,limit:"10mb"}))
app.use(bodyParser.json({limit:'10mb'}))
app.use(cors());
app.use(express.json());
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
   
    cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
       return cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

const upload = multer({ 
    storage: storage,
   
});

router.post('/profileadd', upload.single("image"), async (req, res) => {
    const { name, birthDate, gender } = req.body; 
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token is required'
        });
    }

    if (!name || !birthDate || !gender || !req.file) { 
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        
        const [day, month, year] = birthDate.split('-').map(Number);
        const dateOfBirth = new Date(year, month - 1, day); 

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // const imageUrl = `/uploads/${req.file.filename}`;
        const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`; 

        user.name = name;
        user.birthDate = dateOfBirth;
        user.gender = gender;
        user.image = req.file.filename; 
        
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
                email: user.email,
                image: imageUrl
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

module.exports=router



