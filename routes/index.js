var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

var Game = require("../models/game").game;

/* GET home page. */
router.get('/', function (req, res) {
  if(!req.user){
	  res.render('home');
  }
  else{
	  res.send("yawdgdwg");
  }
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
    User.register(new User({username: req.body.username , password: req.body.password}), function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
	console.log('Name : ' + req.body.username);
	console.log('Pass : ' + req.body.password);
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

/****************************************************************************/

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
	  console.log('Name : ' + req.body.username);
	  console.log('Pass : ' + req.body.password);
	  //res.redirect(303, '/thankyou');
	  res.redirect('/');
	});

module.exports = router;
