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
	this.player1 = new Player("player 1");

  	// Player 2
  	this.player2 = new Player("player 2");

  	// sequence of previous Rounds
  	this.rounds = [];

  	//Game's hand
  	this.currentHand = this.player1;

  	//Game's hand
  	this.currentRound = undefined;

  	//Game's score
  	this.score = [0, 0];
}

/* Check if it's valid move and play in the current round */
Game.prototype.play = function(player, action, value){
	if(this.currentRound.currentTurn !== player){
		throw new Error("[ERROR] INVALID TURN...");}

	if (this.currentRound.fsm.current=='init' || action!='play-card'){
		if(this.currentRound.fsm.cannot(action)){
			throw new Error("[ERROR] INVALID MOVE...");
		}
	}
		

	return this.currentRound.play(action, value,player);
};

Game.prototype.changeHand = function(){
	if(this.currentHand==this.player1){
		return this.player2;
	}else{
		return this.player1;
	}
}

/* Create and return a new Round to this game */
Game.prototype.newRound = function(){
	var round = new Round(this, this.currentHand);
	this.currentRound = round;
	this.currentHand = this.changeHand();
	this.rounds.push(round);
	return this;
}

function StartGame(){
	while((this.score[0]<30) && (this.score[1]<30)){
		var aux = this.player1;
		while(this.currentRound.status='running'){
			prompt(action,value);
			aux = this.play(aux,action,value);
		}
		this.newRound();
	}
}

module.exports.game = Game;
