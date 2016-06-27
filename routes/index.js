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

router.get('/players',function(req,res){
	User.find(function(err, doc){	//list of signed up players
		console.log(doc);
		res.redirect('/');
	});
});

router.get('/login', function(req, res) {
	if (!req.session.user){
		res.render('login', { });
	}
	else{
		res.redirect('/');
	}
});


router.post('/login', function(req, res) {
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
	if(req.session.user){				//if there is a session started
		User.findOne({username:req.body.username, password:req.body.password}, function(err, userf) {
			if(err){
				throw err;
			}else if (userf){ 			//if the user was found
				console.log('User found in data base');
				session2 = new User({username:req.body.username, password:req.body.password});
				res.redirect('/newGame');
			}else{7
				res.render('wrong');
			}
		});
	}else{
		res.redirect('/');
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
	console.log('entra a new game');
	if(req.session.user){						//creates 2 players with the entered data
		var player1= new Player(req.session.user.username);
	    var	player2= new Player(session2.username);
		myGame= new Game(player1, player2);		//creates a new game with those players
		console.log("about to play: "+myGame.player1.name+" vs. "+myGame.player2.name);
		console.log("score: "+myGame.score[0]+" vs "+ myGame.score[1]);
	    res.redirect('/round');					//redirects to round
	}
	else{
		res.redirect('/');
	}
    
});

router.get('/round',function(req, res){
	if(req.session.user && myGame!=undefined){
		myGame.newRound();						//creates new round
		myGame.currentRound.deal();
		res.render('newGame',{myGame: myGame});	//renders the game
	}else{
		res.redirect('/');
	}
	
});


router.post('/round', function(req,res){
	if(!req.session.user){
		res.redirect('/');
	}else{
		console.log("action: "+req.body.what+"value: "+req.body.how);
		myGame.play(myGame.currentRound.currentTurn,req.body.what,req.body.how);
		console.log("si ves esto el error es de index");
		if(myGame.score[0]>=30){				//takes player´s action and value
			myGame=undefined;					//looks for a winner
			res.render('wins', {user: req.session.user.username});
		}else if(myGame.score[1]>=30){
			myGame=undefined;
			res.render('wins', {user: session2.username});
		} else {								//if game hasn´t ended
			if (myGame.currentRound.status!='running'){//creates a new round if necessary
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
