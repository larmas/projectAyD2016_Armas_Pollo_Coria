var expect = require("chai").expect;
var player_model = require("../models/player");
var game_model   = require("../models/game");
var game_card    = require("../models/card");

var Game = game_model.game;
var Card = game_card.card;

describe('Game', function(){
  var game = new Game();

  it('Should have two players', function(){
    expect(game).to.have.property('player1');
    expect(game).to.have.property('player2');
  });
});

describe('Game#play', function(){
  var game;

  beforeEach(function(){
    game = new Game();
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
	  var x=[game.player1.envidoPoints, game.player2.envidoPoints];
	  expect(x==[29, 33]);
  });
  
  it('plays [envido, no-quiero] should give 1 point to chanter', function(){
	  game.play('player1', 'envido');
	  game.play('player2', 'no-quiero-e');
	  expect(game.score==[1, 0]);
  });
  
  it('plays [envido, quiero] should give 2 points to winner', function(){
	  game.play('player1', 'envido');
	  game.play('player2', 'quiero-e');
	  expect(game.score).to.deep.equal([0, 2]);
  });
  
  it('plays [truco, quiero] should give 2 points to winner', function(){
	  game.play('player1', 'truco');
	  game.play('player2', 'quiero-t');
	  game.play('player1', 'play-card',0);
	  game.play('player2', 'play-card',0);
	  game.play('player1', 'play-card',0);
	  game.play('player2', 'play-card',0);
	  game.play('player1', 'play-card',0);
	  game.play('player2', 'play-card',0);
	  expect(game.score==[2, 0]);
  });

});
