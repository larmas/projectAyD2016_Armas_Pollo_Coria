var expect = require("chai").expect;
var player_model = require("../models/player");
var game_model   = require("../models/game");
var game_card    = require("../models/card");

var Game = game_model.game;
var Card = game_card.card;
var Player = player_model.player;

describe('Game', function(){
  var game = new Game();

  it('Should have two players', function(){
    expect(game).to.have.property('player1');
    expect(game).to.have.property('player2');
  });
});

describe('Game#play', function(){
	var game;
	var player1 = new Player("Mariano");
	var player2 = new Player("Leandro");
  	beforeEach(function(){
	  
  		game = new Game(player1, player2);
  		game.newRound();

  		// Force to have the following cards and envidoPoints
  		game.player1.setCards([
  		                     new Card(1, 'copa'),
	                         new Card(7, 'oro'),
	                         new Card(2, 'oro')
	                         ]);

  		game.player2.setCards([
	                         new Card(6, 'copa'),
	                         new Card(7, 'copa'),
	                         new Card(2, 'basto')
	                         ]);
  	});

  	it('It should stablish 29 n 33 as envidoPoints ', function(){
  		var x=[];
  		var y =[29,33];
  		expect([game.player1.envidoPoints, game.player2.envidoPoints]).to.deep.equal([29,33]);
  	});
  
  	it('plays [envido, no-quiero] should give 1 point to chanter', function(){
  		game.play(game.player1, 'envido');
  		game.play(game.player2, 'no-quiero');
  		expect(game.score).to.deep.equal([1, 0]);
  	});
  
  	it('plays [envido, quiero] should give 2 points to winner', function(){
  		game.play(game.player1, 'envido');
  		game.play(game.player2, 'quiero');
  		expect(game.score).to.deep.equal([0, 2]);
  	});
  
  	it('plays [truco, quiero] should give 2 points to winner', function(){
  		game.play(game.player1, 'truco');
  		game.play(game.player2, 'quiero');
  		game.play(game.player1, 'play-card',2);
  		game.play(game.player2, 'play-card',2);
  		game.play(game.player1, 'play-card',1);
  		game.play(game.player2, 'play-card',1);
  		//game.play(game.player1, 'play-card',0);
  		//game.play(game.player2, 'play-card',0);
  		expect(game.score).to.deep.equal([2, 0]);
  	});
  
  	it('plays [envido, quiero, truco, quiero] score should be [2,2]', function(){
  		game.play(game.player1, 'envido');
  		game.play(game.player2, 'quiero');
  		game.play(game.player1, 'truco');
  		game.play(game.player2, 'quiero');
  		game.play(game.player1, 'play-card',2);
  		game.play(game.player2, 'play-card',2);
  		game.play(game.player1, 'play-card',1);
  		game.play(game.player2, 'play-card',1);
  		//game.play(game.player1, 'play-card',0);
  		//game.play(game.player2, 'play-card',0);
  		expect(game.score).to.deep.equal([2,2]);
  	});

});
