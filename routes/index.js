var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Game = require('../models/game').game;
var Player = require('../models/player').player;
var router = express.Router();
var session1= undefined;
var session2= undefined;
var Game = require("../models/game").game;
var myGame=undefined;
/* GET home page. */
router.get('/', function (req, res) {
	res.render('home', {user:req.user});
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	user = new User({username: req.body.username , password: req.body.password});
	user.save(function (err){
		if (err) throw err;
		console.log("new account created");
	});
	res.redirect('/');
});

router.get('/players',function(req,res){
	User.find(function(err, doc){
		console.log(doc);
		res.redirect('/');
	});
});

router.get('/login', function(req, res) {
	if (session1==undefined){
		res.render('login', { });
	}
	else{
		res.redirect('/');
	}
});


router.post('/login', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
	//if(!session){
		User.find({username:req.body.username, password:req.body.password}, function(err){
			if(err){ throw err; }
			else{
				session1=new User({username:req.body.username, password:req.body.password});
			}
		});
	//}
	res.redirect('/menu');
});

router.get('/menu', function(req,res){
	if(session1!=undefined){
		res.render('menu', {user:session1});
	}else{
		res.redirect('/');
	}
});

router.get('/logout', function(req, res) {
    req.logout();
    session1=undefined;
    res.redirect('/');
});

router.get('/newGame', function(req, res) {
	if(session1!=undefined){
		var player1= new Player(session1.username);
	    var	player2= new Player("martin");
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
	if(session1!=undefined && myGame!=undefined){
		myGame.newRound();
		myGame.currentRound.deal();
		res.render('newGame',{myGame: myGame});
	}else{
		res.redirect('/');
	}
	
});


router.post('/round', function(req,res){
	myGame.play(myGame.currentRound.currentTurn,req.body.action,req.body.value);
	if(myGame.score[0]>=30){
		res.send(myGame.player1.name+" wins");
		myGame=undefined;
		res.redirect('/menu');
	}else if(myGame.score[1]>=30){
		res.send(myGame.player2.name+" wins");
		myGame=undefined;
		res.redirect('/menu');
	} else {
		if (myGame.currentRound.status!='running'){
			myGame.newRound();
			myGame.currentRound.deal();
		}
		res.render('newGame',{myGame: myGame});
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
