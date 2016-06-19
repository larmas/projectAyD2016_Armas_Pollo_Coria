var express = require('express');
var User = require('../models/user');
var Game = require('../models/game').game;
var Player = require('../models/player').player;
var router = express.Router();
var session2= undefined;
var Game = require("../models/game").game;
var myGame=undefined;
/* GET home page. */


router.get('/', function (req, res) {
	res.render('home', {user:req.session.user});
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	user = new User({username: req.body.username , password: req.body.password});
	user.save(function (err){
		if (err) {
			res.redirect('/register');
		}else{
			res.redirect('/');
			console.log("new account created");
		}
	});
	
});

router.get('/players',function(req,res){
	User.find(function(err, doc){
		console.log(doc);
		res.redirect('/');
	});
});

router.get('/login', function(req, res) {
	if (!req.session.user){
		res.render('login', { });
	}
	else{
		res.redirect('/menu');
	}
});


router.post('/login', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	if(!req.session.user){
		User.findOne({username:req.body.username, password:req.body.password}, function(err, user) {
			if(err){
				throw err;
			}else{
				console.log('User found in data base');
				req.session.user = new User({username:req.body.username, password:req.body.password});
				res.redirect('/menu');
			}
		});
	}else{
		res.redirect('/wrong');
	}
	
});


router.get('/session2', function(req, res) {
	if (req.session.user){
		res.render('session2', { });
	}
	else{
		res.redirect('/');
	}
});


router.post('/session2', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	if(req.session.user){
		User.findOne({username:req.body.username, password:req.body.password}, function(err, user) {
			if(err){
				throw err;
			}else{
				console.log('User found in data base');
				session2 = new User({username:req.body.username, password:req.body.password});
				res.redirect('/newGame');
			}
		});
	}else{
		res.redirect('/wrong');
	}
	
});

router.get('/menu', function(req,res){
	myGame=undefined;
	if(!req.session.user){
		res.redirect('/');
	}else{
		res.render('menu', {user:req.session.user});
	}
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err){
    	if (err){
    		throw(err);
    	}
    });
    res.redirect('/');
});

router.get('/newGame', function(req, res) {
	if(req.session.user){
		var player1= new Player(req.session.user.username);
	    var	player2= new Player(session2.username);
		myGame= new Game(player1, player2);
		console.log("about to play: "+myGame.player1.name+" vs. "+myGame.player2.name);
		console.log("score: "+myGame.score[0]+" vs "+ myGame.score[1]);
	    res.redirect('/round');
	}
	else{
		res.redirect('/');
	}
    
});

router.get('/round',function(req, res){
	if(req.session.user && myGame!=undefined){
		myGame.newRound();
		myGame.currentRound.deal();
		res.render('newGame',{myGame: myGame});
	}else{
		res.redirect('/');
	}
	
});


router.post('/round', function(req,res){
	if(!req.session.user){
		res.redirect('/menu');
	}
	else{
		myGame.play(myGame.currentRound.currentTurn,req.body.action,req.body.value);
		if(myGame.score[0]>=30){
			myGame=undefined;
			res.render('wins', {user: req.session.user.username});
		}else if(myGame.score[1]>=30){
			myGame=undefined;
			res.render('wins', {user: session2.username});
		} else {
			if (myGame.currentRound.status!='running'){
				myGame.newRound();
				myGame.currentRound.deal();
			}
			res.render('newGame',{myGame: myGame});
		}
	}
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/about', function(req, res){
  res.render('about');
});

router.get('/contact', function(req, res){
  res.render('contact', { csrf: 'CSRF token here'});
});

router.get('/thankyou', function(req, res){
  res.render('thankyou');
});

router.post('/process', function(req,res){
  console.log('Form : ' + req.query.form);
  console.log('CSRF token : ' + req.body._csrf);
  console.log('Name : ' + req.body.email);
  console.log('Pass : ' + req.body.ques);
  res.redirect(303, '/thankyou');
});

module.exports = router;
