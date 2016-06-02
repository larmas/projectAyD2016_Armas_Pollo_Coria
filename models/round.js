/*
 *
 * Represents a game's round
 *
 * @param gmae [Object]: game where the round belongs
 *
 */

var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var deckModel = require("./deck");
var Deck  = deckModel.deck;
var cardModel = require('./card');
var Card = cardModel.card;

function newTrucoFSM(){
  var fsm = StateMachine.create({
  initial: 'init',
  events: [
    { name: 'play-card', 	from: 'init',     					to: 'first-card' },
    { name: 'envido',    	from: ['init', 'first-card'],		to: 'envido' },
    { name: 'quiero-e',    	from: ['envido'],        			to: 'quiero-e'  },
    { name: 'no-quiero-e',  from: ['envido'],              		to: 'no-quiero-e'  },
    { name: 'truco',     	from: ['init', 'first-card',
                         	       'played-card','quiero-e',
                         	       'no-quiero-e'],      		to: 'truco'  },
    { name: 'quiero-t', 	from: ['truco'],              		to: 'quiero-t' },
    { name: 'no-quiero-t', 	from: ['truco'],              		to: 'no-quiero-t' },
    { name: 'play-card', 	from: ['quiero-e', 'no-quiero-e',
                         	       'first-card', 'played-card'],to: 'played-card' },
    { name: 'play-card', 	from: ['quiero-t'],              	to: 'quiero-t' }
  ]});

  return fsm;
}

function newPlayedFSM(){
	  var fsm = StateMachine.create({
	  initial: 'init',
	  events: [
	     { name: 'play-card', 	from: 'init',     				to: 'first-card' },
	     
	     { name: 'play-card-w', from: 'first-card',				to: 'p2-won-1st'  },
	     { name: 'play-card-s', from: 'first-card',				to: 'pardas'  },
	     { name: 'play-card-l', from: 'first-card',				to: 'p1-won-1st'  },
	     
	     { name: 'play-card', 	from: 'p2-won-1st',				to: 'third-card-2'  },
	     { name: 'play-card', 	from: ['pardas',
	                          	       'definitive-hand'],		to: 'definitive-hand'  },
	     { name: 'play-card', 	from: 'p1-won-1st',			 	to: 'third-card-1'  },
	     
	     { name: 'play-card-w', from: 'third-card-2',			to: '1vs1-2'  },
	     { name: 'play-card-s', from: 'third-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-l', from: 'third-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-w', from: 'definitive-hand',		to: 'p2-wins'  },
	     { name: 'play-card-s', from: 'definitive-hand',		to: 'definitive-hand'  },
	     { name: 'play-card-l', from: 'definitive-hand',		to: 'p1-wins'  },
	     { name: 'play-card-w', from: 'third-card-1',			to: '1vs1-1'  },
	     { name: 'play-card-s', from: 'third-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-l', from: 'third-card-1',			to: 'p1-wins'  },
	     
	     { name: 'play-card', 	from: '1vs1-2',				 	to: 'fifth-card-2'  },
	     { name: 'play-card', 	from: '1vs1-1',				 	to: 'fifth-card-1'  },
	     
	     { name: 'play-card-w', from: 'fifth-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-s', from: 'fifth-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-l', from: 'third-card-2',			to: 'p1-wins'  },
	     { name: 'play-card-w', from: 'fifth-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-s', from: 'fifth-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-l', from: 'third-card-1',			to: 'p2-wins'  },
	     
	  ]});

	  return fsm;
	}

function Round(game,turn){
  //Game
  this.game = game;
  
  //next turn
  this.currentTurn = turn;

  //here is a FSM to perform user's actions
  this.fsm = newTrucoFSM();
  
  this.fsmCP = newPlayedFSM();

  this.auxCard = undefined;
  
  //Round' score
  this.score = [0, 0];
}

/*
 * Generate a new deck mixed and gives to players the correspondent cards
 */
Round.prototype.deal = function(){
	var deck = new Deck().mix();
  	this.game.player1.setCards(_.pullAt(deck, 0, 2, 4));
  	this.game.player2.setCards(_.pullAt(deck, 1, 3, 5));
};

Round.prototype.changeTurn = function(game){
	if (this.fsmCP.current=='p2-won-1st' || this.fsmCP.current=='1vs1-1' || this.fsmCP.current=='1vs1-2'){
		this.currentTurn;
	}
	else{
		this.currentTurn = this.switchPlayer(this.currentTurn,game);
	}
}
/*
 * returns the opossite player
 */
Round.prototype.switchPlayer=function (player,game) {
	if(player==game.player1){
		return game.player2;
	}
	else{
		return game.player1;
	}
};

Round.prototype.calculateScore = function(action,fsm,fsmCP){
	if(action == 'quiero-e'){
		if (this.game.player1.envidoPoints<this.game.player2.envidoPoints){
			this.score = [0, 2];
		}else{
			this.score = [2, 0];
		}
	}
	else if (action=='no-quiero-e'){this.score[1,0];}
	else if	(action=='no-quiero-t'){this.score[1,0];}
	else if (action=='play-card'){
		if(fsmCP.current=='p1-wins'){
			if(fsm.current=='quiero-t'){
				this.score = [2, 0];
			}else{
				this.score = [1, 0];
			}
		}else if(fsmCP.current=='p2-wins'){
			if(fsm.current=='quiero-t'){
				this.score = [0, 2];
			}else{
				this.score = [0, 1];
			}
		}
	}
	
	this.game.score[0] += this.score[0];
	this.game.score[1] += this.score[1];

	return this.score;
}

function makePlay(action,i,fsm,fsmCP,currentTurn){
	fsm[action]();
	if(action=='play-card'){
		if (this.auxCard == undefined){
			fsmCP['play-card']();
			this.auxCard = currentTurn.cards[i];
		}
		else if(currentTurn.cards[i].confront(this.auxCard)==1){//last played card defeats aux
			fsmCP['play-card-w']();
			this.auxCard = undefined;
		}
		else if(currentTurn.cards[i].confront(this.auxCard)==0){//last played card same weight as aux
			fsmCP['play-card-s']();
			this.auxCard = undefined;
		}
		else if(currentTurn.cards[i].confront(this.auxCard)==-1){//last played card defeated by aux
			fsmCP['play-card-l']();
			this.auxCard = undefined;
		}
		delete currentTurn.cards[i];
	}
}

/*
 * Let's Play :)
 */
Round.prototype.play = function(action, value,player) {
	// move to the next state
	makePlay(action,value,this.fsm,this.fsmCP,player);
	// check if is needed sum score
	this.calculateScore(action, this.fsm, this.fsmCP);

	// Change player's turn
	this.changeTurn(this.game);
};

module.exports.round = Round;
