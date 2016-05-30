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
  /*
   * Player 1
   */
  this.player1 = new Player("player 1");

  /*
   * Player 2
   */
  this.player2 = new Player("player 2");

  /*
   * sequence of previous Rounds
   */
  
  this.rounds = [];

  /*
   * Game's hand
   */
  this.currentHand = 'player1';

  /*
   * Game's hand
   */
  this.currentRound = undefined;

  /*
   * Game' score
   */
  this.score = [0, 0];
}

/*
 * Check if it's valid move and play in the current round
 */
Game.prototype.play = function(player, action, value){
	if(this.currentRound.currentTurn !== player)
		throw new Error("[ERROR] INVALID TURN...");

	if(this.currentRound.fsm.cannot(action))
		throw new Error("[ERROR] INVALID MOVE...");

	return this.currentRound.play(action, value);
};

Game.prototype.changeTurn = function(){
	if (this.currentHand.wonH != undefined){
		if(this.currentHand.wonH.indexOf(this.currentRound.roundN)!=-1){
			return this.currentHand;
		}else{
			 return this.currentHand = switchPlayer(this.currentHand);
		}
	}
	else{
		return this.currentTurn = switchPlayer(this.currentTurn);
	}
}
/*
 * Create and return a new Round to this game
 */
Game.prototype.newRound = function(numRound){
  var round = new Round(this, this.currentHand,numRound);
  this.currentRound = round;
  this.currentHand = this.changeTurn();
  this.rounds.push(round);
  return this;
}

function noCL(){
	return (this.player1.cards==[]) && (this.player2.cards==[]);
}

/*
 * returns the opossite player
 */
function switchPlayer(player) {
  return "player1" === player ? "player2" : "player1";
};

module.exports.game = Game;
