const mongoose = require('mongoose');
const validator = require('validator');
const registerschema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email address');
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Set your desired minimum password length here
  },
  classname: { 
    type: String, required: true },

    category: 
    { type: String,
      required: true }
});
module.exports = mongoose.model('Registered', registerschema);
