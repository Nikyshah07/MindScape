import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
const app = express();
app.use(cors());
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
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
        { id: user._id, email: user.email }, 
        process.env.JWT_SECRET, 
       
    );
    user.token = token; 
    await user.save();
    res.status(200).json({ message: 'Login successful...', user: { email: user.email } ,token});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/', (req,res) => {
    res.send("Hello from backend")
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));