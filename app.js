const express = require('express');
const hbs = require('hbs');
const path = require('path'); // Import the 'path' module
const app = express();

// Set up the 'hbs' view engine
app.set('view engine', 'hbs');
// Set the 'public' folder as the static folder
app.use(express.static(path.join(__dirname, 'public')));


// First GET request for Page 1
app.get('/', (req, res) => {
  // Render the 'page' view and pass the 'data1' object to the template
  res.render('index');
});

// Second GET request for Page 2
app.get('/show', (req, res) => {
  // Render the 'page' view and pass the 'data2' object to the template
  res.render('show');
});
app.get('/search', (req, res) => {
    // Render the 'page' view and pass the 'data2' object to the template
    res.render('search');
  });
// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000/');
});
