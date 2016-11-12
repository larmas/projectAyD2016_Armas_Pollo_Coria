var express = require('express');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var expressValidator = require('express-validator');

var User = require('../models/user');
var Game = require('../models/game').game;
var Player = require('../models/player').player;
var session2= undefined;
var Game = require("../models/game").game;
var myGame=undefined;

app.disable('x-powered-by');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'max',
    resave: false,
    saveUninitialized: false
}));

// mongoose
mongoose.connect('mongodb://127.0.0.1/truco-development');

var messages = [{
  id: 1,
  text: "Hola soy un mensaje",
  author: "Carlos"
}];

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('home',{user:req.session.user});
});

app.get('/register', function(req, res) {
    res.render('register', { });
});

app.post('/register', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	usr = new User({username: req.body.username , password: req.body.password});
	usr.save(function (err){  //save new user
		if (err) {				//in case of an already existing user, f5
			res.redirect('/register');
		}else{
			console.log("new account created");
			res.redirect('/');
		}
	});
});

app.get('/players',function(req,res){
	User.find(function(err, doc){	//list of signed up players
		console.log(doc);
		res.redirect('/');
	});
});

app.get('/login', function(req, res) {
	if (!req.session.user){
		res.render('login', { });
	}
	else{
		res.redirect('/');
	}
});

app.post('/login', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	if(!req.session.user){		//if there is no session opened
		User.findOne({username:req.body.username, password:req.body.password}, function(err, userf) {
			if(err){			//tries to find the user with the entered data
				throw err;
			}else if (userf){
				console.log('User found in data base');
				req.session.user = new User({username:req.body.username, password:req.body.password});
				res.redirect('/');
			}else{
				res.render('wrong');
			}
		});
	}else{
		res.redirect('/');
	}
});

app.get('/session2', function(req, res) {
	if (req.session.user){
		res.render('session2', { });
	}
	else{
		res.redirect('/');
	}
});

app.post('/session2', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	if(req.session.user){				//if there is a session started
		User.findOne({username:req.body.username, password:req.body.password}, function(err, userf) {
			if(err){
				throw err;
			}else if (userf){ 			//if the user was found
				console.log('User found in data base');
				session2 = new User({username:req.body.username, password:req.body.password});
				res.redirect('/newGame');
			}else{
				res.render('wrong');
			}
		});
	}else{
		res.redirect('/');
	}
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err){
    	if (err){
    		throw(err);
    	}
    });
    res.redirect('/');
});

app.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

app.get('/about', function(req, res){
  res.render('about');
});

app.get('/contact', function(req, res){
  res.render('contact', { csrf: 'CSRF token here'});
});

app.get('/thankyou', function(req, res){
  res.render('thankyou');
});

app.post('/process', function(req,res){
  console.log('Form : ' + req.query.form);
  console.log('CSRF token : ' + req.body._csrf);
  console.log('Name : ' + req.body.email);
  console.log('Pass : ' + req.body.ques);
  res.redirect(303, '/thankyou');
});

io.on('connection', function(socket) {
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', messages);

  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });
});

server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});
