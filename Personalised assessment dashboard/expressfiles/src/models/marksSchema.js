const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  classname: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const marks = mongoose.model('Studentmark', markSchema);

module.exports = marks;
