const express = require('express');
const express_handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const db = require('./config/key.js').mongoURI;

mongoose.Promise = global.Promise;

require('./models/Idea.js');
const Idea = mongoose.model('ideas');

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected ...'))
  .catch(err => console.log(err));

const app = express();

app.engine('handlebars', express_handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

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

// Edit idea
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then(idea => {
    res.render('ideas/edit', {
      idea: idea,
    });
  });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas,
      });
    });
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
    const newUSer = {
      title: req.body.title,
      details: req.body.details,
    };
    new Idea(newUSer).save().then(idea => {
      req.flash('success_msg', 'Video idea added');
      res.redirect('/ideas');
    });
  }
});

// Edit Form process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id,
  }).then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then(idea => {
      req.flash('success_msg', 'Video idea updated');
      res.redirect('/ideas');
    });
  });
});

// Delete idea
app.delete('/ideas/:id', (req, res) => {
  // res.send('DELETE');
  Idea.deleteOne({ _id: req.params.id }, err => {
    if (err) return err;
  }).then(() => {
    req.flash('success_msg', 'Video idea removed');
    res.redirect('/ideas');
  });
});

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
