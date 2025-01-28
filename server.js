const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"]
}));

app.use(express.json());
dotenv.config();

const response = mongoose.connect( process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
if(response){
    console.log('Connected to DB')
}
else{
    console.log('Not Connected')
}

//register route
app.post('/register', async (req, res) => {
  const { name,email, password ,confirmPassword} = req.body;
if(password!==confirmPassword)
{
    return res.status(400).json({message:'Passwords does not match'})
}

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
     const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name,email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully...' });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET,  // Secret Key
      { expiresIn: '1h' }       // ✅ Added expiration time
    );

    // Save token in the database
    user.token = token; 
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful...',
      user: { email: user.email },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



app.get('/', (req,res) => {
    res.send("Hello from backend")
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));