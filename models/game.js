/*
 *
 * Represents a game
 * @param player1 [String]: name of player 1
 * @param player2 [String]: name of player 2
 *
 */

var _ = require('lodash');
var playerModel = require("./player");
var roundModel = require("./round");


var Player = playerModel.player;
var Round  = roundModel.round;

function Game(player1, player2){
	//Player 1
	this.player1 = player1;

  	// Player 2
  	this.player2 = player2;

  	// sequence of previous Rounds
  	this.rounds = [];

  	//Game's hand
  	this.currentHand = player1;

  	//Game's hand
  	this.currentRound = undefined;

  	//Game's score
  	this.score = [0, 0];
  	
};

/* Check if it's valid move and play in the current round */
Game.prototype.play = function(player, action, value){
	if(this.currentRound.currentTurn !== player){
		throw new Error("[ERROR] INVALID TURN...");}

	if (this.currentRound.fsm.current=='init' || this.currentRound.fsm.current=='first-card' || action!='play-card'){
		if(this.currentRound.fsm.cannot(action)){
			throw new Error("[ERROR] INVALID MOVE...");
		}
	}
	return this.currentRound.play(action, value,player);
};

Game.prototype.changeHand = function(){

	if (this.currentHand == undefined){
		this.currentHand = this.player1;
	}
	else{
		if(this.currentHand==this.player1){
			this.currentHand = this.player2;
		}else{
			this.currentHand = this.player1;
		}
	}
};

/* Create and return a new Round to this game */
Game.prototype.newRound = function (){
	var round = new Round(this, this.currentHand);
	this.currentRound = round;
	this.rounds.push(round);
	this.changeHand();
	return this;
};


module.exports.game = Game;
