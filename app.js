var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
var app = express();
var routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
const db = mongoose.connect(process.env.MONGOLAB_URI || process.env.DATABASE || 'mongodb://localhost:27017/restaurantReviews', {
    useMongoClient: true
});

db.on('error', function(err){
    console.error('connection error:', err)
});

// use sessions for tracking logins
app.use(session({
    secret: 'foodhits is the best',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// make user ID available in templates
app.use(function (req, res, next) {
    res.locals.currentUser = req.session.userId;
    next();
});


db.once('open', function() {
    console.log('db connected');
});

//Routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
    res.render('404');
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
