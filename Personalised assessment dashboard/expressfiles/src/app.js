const mongoose=require("mongoose");
const express = require("express");
const session=require("express-session");
const app = express();
const connectdb=require("./db/conn");
const Registration=require("./models/schema.js")
const Question = require('./models/quizSchema');
const Marks = require('./models/marksSchema');
const path = require('path');
const hbs = require('hbs');
const port = process.env.PORT || 4000;
connectdb();
// Register the json helper
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.set("view engine", "hbs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set up the session middleware
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false,
}));

//creating logout
app.get('/logout', (req, res) => {
  // Clear the user's session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error clearing session:', err);
    }
    // Redirect the user to the login page or any other appropriate page after logging out
    res.redirect('/login');
  });
});
//creating routes
app.get("/", (req, res) => {
    res.render("register.hbs");
});
app.get("/login",(req,res)=>{
  res.render("login.hbs");
});
app.get('/index', (req, res) => {

  res.render('index');
});
app.get("/report",async(req,res)=>{
try{
const student=await Marks.findOne({name:req.session.username,classname:req.session.classname});
console.log(student);
const studobj={
  name:student.name,
  score:student.score,
  total:student.total,
  percentage:((student.score/student.total)*100)
}
if(student===null)
{
  res.send("You have no results at the moment");

}
else
{
res.render("student_result",{studobj});
}
}
catch (error) {
  console.error('Error fetching data:', error);
  res.status(500).send('Internal Server Error');
}
})
app.get("/result",async(req,res)=>{
  try {
    // Fetch data from the MongoDB collection
    const allMarks = await Marks.find();

    // Calculate the average marks for each class
    const classAverageMarks = allMarks.reduce((acc, curr) => {
      if (!acc[curr.classname]) {
        acc[curr.classname] = { totalMarks: 0, count: 0 };
      }
      acc[curr.classname].totalMarks += curr.score;
      acc[curr.classname].count++;
      return acc;
    }, {});

    // Calculate the average for each class and convert data to an array of objects
    const classAverageData = [];
    for (const classname in classAverageMarks) {
      const average = classAverageMarks[classname].totalMarks / classAverageMarks[classname].count;
      classAverageData.push({ classname, average });
    }
console.log(classAverageData);
    // Pass the data to the HBS template
    res.render('report', { classAverageData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
 });

app.get('/studentindex', (req, res) => {
  if(req.session.category==="student")
  res.render('studentindex');
  else
  res.redirect("/");
});
app.get('/teacherindex', (req, res) => {
  if(req.session.category==="teacher")
  res.render('teacherindex');
  else
  res.redirect("/");
});

app.get('/admin', async(req, res) => {
  if(req.session.category==="Admin"){
  try {
    const teachers = await Registration.find({category:"teacher"});
    res.render('admin', { teachers });
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).send('Internal Server Error');
  }
}
else{
  res.redirect("/");
}
});
app.get('/QuestionData', async(req, res) => {
  if(req.session.category==="Admin"){
  try {
    const questions = await Question.find({});
    res.render('adminQuestions', { questions });
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).send('Internal Server Error');
  }}
  else
  {
    res.redirect("/");
  }
});
app.get('/studentsData', async(req, res) => {
  if(req.session.category==="Admin"){
  try {
    const students = await Registration.find({category:"student"});
    res.render('adminStudents', { students });
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).send('Internal Server Error');
  }}
  else
  {
    res.redirect("/");
  }
});
// Route to handle student deletion
app.get('/adminStudents/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Registration.findByIdAndDelete(id);
    res.redirect('/studentsData');
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Route to handle question deletion
app.get('/adminQuestions/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Question.findByIdAndDelete(id);
    res.redirect('/QuestionData');
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle teacher deletion
app.get('/admin/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Registration.findByIdAndDelete(id);
    res.redirect('/admin');
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/quizsubmit",async(req,res)=>{
  const classname=req.session.classname ;
  
  if(req.session.category==="student")
  {
    try {
       // Set the student class you want to filter
       const studentclass=req.session.classname ;
      // Fetch all the questions where the 'studentclass' matches the given value
      const questions = await Question.find({ classname });
  if(questions.length===0)
  {
    res.send("No quiz lined up at the moment");
  }
  else{
      res.render('quizsubmit', { questions: questions });
  }
    } catch (err) {
      console.error('Error fetching questions:', err);
      res.status(500).send('Internal Server Error');
    }
  }
  else
  {
    res.redirect("/");
  }
});


app.post('/login', async (req, res) => {
  const  email=req.body.email;
  const password =req.body.password;
console.log(req.body.email);
console.log(req.body.password);
  try {
    // Find the user with the provided email and password
    const user = await Registration.findOne({ email, password });
    console.log(user); 
    if (user) {
      // If user is found, send a success response
      req.session.username = user.fullname;
      req.session.classname = user.classname;
      req.session.category = user.category;
      if(user.category==="student")
      res.redirect(`/studentindex`);
      else if(user.category==="teacher")
      {
        res.redirect("/teacherindex");
      }
      else if(user.category==="Admin")
      {
        res.redirect("/admin");
      }
      //res.json({ message: 'Login successful!', user });
    } else {
      // If user is not found, send an error response
      res.status(404).json({ message: 'User not found. Invalid email or password.' });
    }
  } catch (error) {
    // Handle any errors that occurred during the database query
    console.log(error);
    res.status(500).json({ message: 'Error finding user.', error: error.message });
  }
});
app.get("/quizSet",(req,res)=>{
  if(req.session.category==="teacher")
  res.render("QuizSet");
  else
  res.redirect("/");
});

app.post('/addQuestions', async (req, res) => {
  try {
    // Get the total number of questions submitted
    const totalQuestions = (req.body.question_1);
    const name=req.session.classname;
console.log(req.body);
console.log(totalQuestions);
console.log(name);
    // Loop through each question and save it to the database
    for (let questionCount = 1; questionCount <= 2; questionCount++) {
      const questionData = {
        question: req.body[`question_${questionCount}`],
        correctAnswer: parseInt(req.body[`answer_${questionCount}`]),
        options: [
          req.body[`option1_${questionCount}`],
          req.body[`option2_${questionCount}`],
          req.body[`option3_${questionCount}`],
          req.body[`option4_${questionCount}`],
        ],
      classname:name
      };

      const newQuestion = new Question(questionData);
      await newQuestion.save();
    }

    res.send('Questions added successfully.');
  } catch (err) {
    console.error('Error adding questions:', err);
    res.status(500).send('Internal server error');
  }
});


app.post("/register", async(req, res) => {
    const fullname=req.body.fullname;
    const email=req.body.email;
    const password=req.body.password;
    const classname =req.body.classname;
    const category  = req.body.category;
const newRegistration = new Registration({
  fullname: fullname,
  email: email,
  password: password,
  classname: classname,
  category: category,
});

newRegistration
  .save()
  .then(() => {
    res.redirect('/login');
  })
  .catch((error) => {
    console.error('Error saving to MongoDB:', error);
    res.status(500).send('Error saving registration data.');
  });
});
app.post('/submitQuiz', async (req, res) => {
  try {
    const formData = req.body;
    const classname=req.session.classname;
    const username=req.session.username;
    console.log(classname);
    // Iterate through the form data and extract question numbers and selected answers
    const userAnswers = Object.keys(formData).map((key) => {
      const questionNumber = parseInt(key.match(/\d+/)[0], 10);
      return {
        questionNumber,
        selectedAnswer: parseInt(formData[key], 10)+1, // Convert selected answer to integer
      };
    });

    // Fetch actual answers from the MongoDB database
    const questions = await Question.find({classname});
    const totalmarks=questions.length;
    // Calculate the user's marks by comparing the selected answers with the actual answers
    let userMarks = 0;
    userAnswers.forEach((userAnswer) => {
      const question = questions[userAnswer.questionNumber];
      if (question.correctAnswer === userAnswer.selectedAnswer) {
        userMarks++;
      }
    });
console.log(userMarks);
    // Store the user's marks in the UserMark collection
    const userMark = new Marks({
      name:username ,
      classname:classname, // Replace this with the actual user ID or other identification
      score: userMarks,
      total:totalmarks,
    });
    await userMark.save();

    // You can also send the userMarks back to the client to display the result
    res.send(`Your submission is recorded`);
  } catch (err) {
    console.error('Error processing quiz:', err);
    res.status(500).send('You have already submitted');
  }
});
app.listen(port, () => {
    console.log("Listening at port 4000");
})