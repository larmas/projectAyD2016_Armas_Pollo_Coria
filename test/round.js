var expect = require("chai").expect;
var card_model   = require("../models/card");
var player_model = require("../models/player");
var game_model   = require("../models/game");
var round_model   = require("../models/round");

var Game  = game_model.game;
var Round = round_model.round;
var Player= player_model.player;

describe('Round', function(){
	var game;

  beforeEach(function(){
	var player1 = new Player("player 1");
	var player2 = new Player("player 2");
    game = new Game(player1, player2);
    game.newRound();
  });

  describe("#deal", function(){
    it("should populate player1 cards", function(){
      game.currentRound.deal();
      expect(game.player1.cards.length).to.be.equal(3);
    });

    it("should populate player2 cards", function(){
      game.currentRound.deal();
      expect(game.player2.cards.length).to.be.equal(3);
    });
    
  });
});
