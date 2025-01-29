const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');  // For OTP generation
const loginRoute=require('./routes/login.js')
const registerRoute=require('./routes/register.js')
const resetPassword=require('./routes/resetPassword.js')
const forgotPassword=require('./routes/forgotPassword.js')
const verifyOtp=require('./routes/verifyOtp.js')
const otpStore=require('./routes/otpStore.js')
dotenv.config();

const app = express();
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"]
}));

app.use(express.json());
dotenv.config();

const response = mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
if(response){
    console.log('Connected to DB')
}
else{
    console.log('Not Connected')
}



app.use('/',loginRoute)
app.use('/',registerRoute)
app.use('/',forgotPassword)
app.use('/',verifyOtp)
app.use('/',resetPassword)


app.get('/', (req, res) => {
  res.send("Hello from backend");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

