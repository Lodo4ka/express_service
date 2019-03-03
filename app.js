const express = require('express');
const express_handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const db = require('./config/key.js').mongoURI;

mongoose.Promise = global.Promise;

require('./models/Idea.js');
const Idea = mongoose.model('ideas');

mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected ...'))
  .catch(err => console.log(err));

const app = express();

app.engine('handlebars', express_handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 5000;

app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title,
  });
});

app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.post('/ideas', (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please add a title' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Please add some details' });
  }
  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
    });
  } else {
    res.send('passed');
  }
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
