const mongoose = require('mongoose');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{ 
        type: String,
         required: true
     }
     ,
     token: { 
        type: String,
        default: null 
    }
})

const User = mongoose.model('mindscapeuser', UserSchema);
module.exports = User;