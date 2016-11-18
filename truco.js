var express = require('express');
var _ = require('lodash');
var app = express();
var routes = require('./routes/index');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var expressValidator = require('express-validator');
var router = express.Router();
var User = require('./models/user');
var Game = require('./models/game').game;
var Player = require('./models/player').player;
var session2= undefined;
var Game = require("./models/game").game;
var myGame=undefined;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 8080);

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

app.use('/', router);
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
    if (err) {        //in case of an already existing user, f5
      res.redirect('/register');
    }else{
      console.log("new account created");
      res.redirect('/');
    }
  });
});

router.get('/players',function(req,res){
  User.find(function(err, doc){ //list of signed up players
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
  if(!req.session.user){    //if there is no session opened
    User.findOne({username:req.body.username, password:req.body.password}, function(err, userf) {
      if(err){      //tries to find the user with the entered data
        throw err;
      }else if (userf){
        console.log('User found in data base');
        if (!req.session){console.log('User found in data base');}
        req.session.user = new User({username:req.body.username, password:req.body.password});
        res.redirect('/');
      }else{
        res.render('wrong');
      }
    });
  }else {
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
  if(req.session.user){           //creates 2 players with the entered data
      var player1= new Player(req.session.user.username);
      var player2= new Player("");
      playerView=player1.name;
      myGame= new Game(player1, player2);   //creates a new game with those players
      console.log("about to play: "+myGame.player1.name+" vs. "+myGame.player2.name);
      console.log("score: "+myGame.score[0]+" vs "+ myGame.score[1]);
      res.redirect('/round');
  } else{
    console.log("no session1");
    res.redirect('/');
  }
});

router.get('/round',function(req, res){
  if(req.session.user && myGame!=undefined){
    if(!myGame.currentRound){
      myGame.newRound();            //creates new round
      myGame.currentRound.deal();
    }else{
      if(myGame.score[0]>=30){        //takes player´s action and value
        myGame=undefined;         //looks for a winner
        res.render('wins', {user: req.session.user.username});
      }else if(myGame.score[1]>=30){
        myGame=undefined;
        res.render('wins', {user: "hola1"});
      } else {                //if game hasn´t ended
        if (myGame.currentRound.status!='running'){//creates a new round if necessary
          myGame.newRound();
          myGame.currentRound.deal();
        }
      }
    }
    console.log("llamo al render newGame");
      res.render('newGame',{myGame: myGame, playerView: req.session.user.username}); //renders the game
  }else{
    res.redirect('/');
  }
});

io.sockets.on("connection", function(socket){
  socket.on("join", function(username){
    console.log("entra a joooinnnn");
    p2 = new Player(username);
    myGame= new Game (myGame.player1, p2)
    console.log("player2 name: "+myGame.player2.name);
    io.emit('refresh');
  });

  socket.on("play", function(action, value, username){
    myGame.play(myGame.currentRound.currentTurn,action,value);
    console.log("esos parametros llegan a socket.on:"+action+" "+value);
    console.log("si ves esto el error es de index");
    console.log("refresh y paso el newgame, can quiero: "+myGame.currentRound.fsm.can('quiero'));
    console.log(myGame.currentRound.fsm.current);
    io.emit('refresh');
  });
});//End of socket on connection

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

server.listen(3000,function(req,res){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});
module.exports = app;
