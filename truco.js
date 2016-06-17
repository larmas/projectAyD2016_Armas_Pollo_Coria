var express = require('express');
var _ = require('lodash');
var Game = require("./models/game").game;
var Player = require("./models/player").player;
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var routes = require('./routes/index');
var users = require('./routes/users');
var formidable = require('formidable');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

app.disable('x-powered-by');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'jade');
app.use(require('body-parser').urlencoded({extended: true}));

//var credentials = require('./credentials.js');
//app.use(require('cookie-parser')(credentials.cookieSecret));
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

/*passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());*/

// mongoose
mongoose.connect('mongodb://127.0.0.1/truco-development');

app.use('/', routes);
app.use(function(req, res, next){
  console.log("Looking for URL : " + req.url);
  next();
});

app.get('/junk', function(req, res, next){
  console.log('Tried to access /junk');
  throw new Error('/junk doesn\'t exist');
});

app.use(function(err, req, res, next){
  console.log('Error : ' + err.message);
  next();
});

app.use(function(req, res){
  res.type('text/html');
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});

module.exports = app;

