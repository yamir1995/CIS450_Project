var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var cors = require('cors');
var pg = require('pg');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/node-auth')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


var conString = "postgres://csuser:password@csinstance.coupnmbhqr45.us-west-2.rds.amazonaws.com:5432/cis450";
var client = new pg.Client(conString);
client.connect();


app.use('/', index);
app.use('/users', users);


app.post('/query', function (req, res) {
  if (req.body.queryType == 1) {
    client.query("SELECT DISTINCT m.title FROM movies as m JOIN movies_genres as mg ON m.idmovies = mg.idmovies JOIN genres as g ON mg.idgenres = g.idgenres WHERE g.genre = '" + req.body.queryString + "' limit 100")
      .then((result) => {
      res.send({
      title: 'Movies in the ' + req.body.queryString + ' genre',
      results: result.rows
    })

  })
  .catch((e) => {
      console.log(e)
  })
  } else if (req.body.queryType == 2) {
    client.query("SELECT DISTINCT m.title FROM movies as m JOIN movies_genres as mg ON m.idmovies = mg.idmovies JOIN genres as g ON mg.idgenres = g.idgenres WHERE g.genre = '" + req.body.queryString + "' limit 100")
      .then((result) => {
      res.send({
      title: 'Second Test ' + req.body.queryString + ' .',
      results: result.rows
    })

  })
  .catch((e) => {
      console.log(e)
  })
  }
});

// passport configuration
var User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
