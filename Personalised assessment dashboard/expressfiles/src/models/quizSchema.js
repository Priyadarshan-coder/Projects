// models/question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    minlength:2,
    required: true,
  },
  correctAnswer: {
    type: Number,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  classname:{
    type:String,
    required:true
  }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
