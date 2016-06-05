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
		events: 
			[{ name: 'play-card', 		from: 'init',     					to: 'first-card' },
			 { name: 'envido',    		from: ['init', 'first-card'],		to: 'envido' },
			 { name: 'envido',    		from: ['envido'],					to: 'envido-e' },
			 { name: 'real-envido',		from: ['init', 'first-card'],		to: 'real-envido' },
			 { name: 'real-envido',    	from: ['envido'],					to: 'envido-re' },
			 { name: 'real-envido',    	from: ['envido-e'],					to: 'envido-e-re' },
			 { name: 'f-envido',    	from: ['init', 'first-card',
			                        	       'envido','real-envido',
			                        	       'envido-e','envido-re',
			                        	       'envido-e-re'],				to: 'f-envido'},
			 
			 { name: 'quiero-e',    	from: ['envido'],        			to: 'quiero-e'  },
			 { name: 'quiero-e-e',    	from: ['envido-e'],        			to: 'quiero-e-e'  },
			 { name: 'quiero-re',    	from: ['real-envido'],        		to: 'quiero-re'  },
			 { name: 'quiero-e-re',    	from: ['envido-re'],        		to: 'quiero-e-re'  },
			 { name: 'quiero-e-e-re',  	from: ['envido-e-re'],     			to: 'quiero-e-e-re'  },
			 { name: 'quiero-fe',    	from: ['f-envido'],        			to: 'quiero-fe'  },
			 
			 { name: 'no-quiero-e',    	from: ['envido'],        			to: 'no-quiero-e'  },
			 { name: 'no-quiero-e-e',  	from: ['envido-e'],        			to: 'no-quiero-e-e'  },
			 { name: 'no-quiero-re',   	from: ['real-envido'],        		to: 'no-quiero-re'  },
			 { name: 'no-quiero-e-re', 	from: ['envido-re'],        		to: 'no-quiero-e-re'  },
			 { name: 'no-quiero-e-e-re',from: ['envido-e-re'],     			to: 'no-quiero-e-e-re'  },
			 { name: 'no-quiero-fe',    from: ['f-envido'],        			to: 'no-quiero-fe'  },

			 { name: 'truco',     		from: ['init', 'first-card',
			                      		       'played-card','quiero-e',
			                      		       'no-quiero-e','quiero-e-e',
			                      		       'quiero-re','quiero-e-re',
			                      		       'quiero-e-e-re','quiero-fe',
			                      		       'no-quiero-e-e','no-quiero-re',
			                      		       'no-quiero-e-re','no-quiero-e-e-re',
			                      		       'no-quiero-fe'],      		to: 'truco'  },
			 { name: 'quiero-t', 		from: ['truco'],              		to: 'quiero-t' },
			 { name: 'no-quiero-t', 	from: ['truco'],              		to: 'no-quiero-t' },
			 { name: 'retruco', 		from: ['truco','quiero-t'],    		to: 'retruco' },
			 { name: 'no-quiero-rt', 	from: ['retruco'],              	to: 'no-quiero-rt' },
			 { name: 'quiero-rt', 		from: ['retruco'],              	to: 'quiero-rt' },
			 { name: 'vale4', 			from: ['retruco','quiero-rt'],      to: 'vale4' },
			 { name: 'no-quiero-v4', 	from: ['vale4'],              		to: 'no-quiero-v4' },
			 { name: 'quiero-v4', 		from: ['vale4'],	              	to: 'quiero-v4' },
			 
		]});
	return fsm;
}

function newPlayedFSM(){
	var fsm = StateMachine.create({
	initial: 'init',
	events: 
		[{ name: 'play-card', 	from: 'init',     				to: 'first-card' },
	     
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
	     { name: 'play-card-s', from: 'definitive-hand',		to: 'pardas-2'  },
	     { name: 'play-card-l', from: 'definitive-hand',		to: 'p1-wins'  },
	     { name: 'play-card-w', from: 'third-card-1',			to: '1vs1-1'  },
	     { name: 'play-card-s', from: 'third-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-l', from: 'third-card-1',			to: 'p1-wins'  },
	     
	     { name: 'play-card', 	from: '1vs1-2',				 	to: 'fifth-card-2'  },
	     { name: 'play-card', 	from: 'pardas-2',				to: 'fifth-card-1'  },
	     { name: 'play-card', 	from: '1vs1-1',				 	to: 'fifth-card-1'  },
	     
	     { name: 'play-card-w', from: 'fifth-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-s', from: 'fifth-card-2',			to: 'p2-wins'  },
	     { name: 'play-card-l', from: 'fifth-card-2',			to: 'p1-wins'  },
	     { name: 'play-card-w', from: 'fifth-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-s', from: 'fifth-card-1',			to: 'p1-wins'  },
	     { name: 'play-card-l', from: 'fifth-card-1',			to: 'p2-wins'  },	     
	]});
	return fsm;
}

function Round(game,turn){
	//Game
	this.game = game;
  
	//next turn
	this.currentTurn = turn;

	//FSMs to perform user's actions
	this.fsm = newTrucoFSM();
	this.fsmCP = newPlayedFSM();
  
	this.auxCard = undefined;
  
	//Round's score
	this.score = [0, 0];
	
	this.status='running';
}

/* Generates a new deck shuffled and gives to players the correspondent cards */
Round.prototype.deal = function(){
	var deck = new Deck().mix();
  	this.game.player1.setCards(_.pullAt(deck, 0, 2, 4));
  	this.game.player2.setCards(_.pullAt(deck, 1, 3, 5));
};

Round.prototype.changeTurn = function(game){
	if (this.fsmCP.current=='p2-won-1st' || this.fsmCP.current=='1vs1-1' || this.fsmCP.current=='1vs1-2'){
		return this.currentTurn;
	}
	else{
		return this.currentTurn = this.switchPlayer(this.currentTurn,game);
	}
}

/* returns the opposite player */
Round.prototype.switchPlayer=function (player,game) {
	if(player==game.player1){
		return game.player2;
	}
	else{
		return game.player1;
	}
};

Round.prototype.calculateScore = function(action,fsm,fsmCP,currentTurn){
	aux  = (currentTurn==this.game.player1);
	aux2 = (this.game.currentHand==this.game.player1);
	auxEn =	this.game.player1.envidoPoints<this.game.player2.envidoPoints;
	x=30-this.game.score[0];//puntos faltan j1
	y=30-this.game.score[1];//puntos faltan j2
	if(action == 'quiero-e')				{if(auxEn){this.score=[0,2];} else{this.score=[2,0];}}
	else if (action=='quiero-e-e')			{if(auxEn){this.score=[0,4];} else{this.score=[4,0];}}
	else if (action=='quiero-re')			{if(auxEn){this.score=[0,3];} else{this.score=[3,0];}}
	else if (action=='quiero-e-re')			{if(auxEn){this.score=[0,5];} else{this.score=[5,0];}}
	else if (action=='quiero-e-e-re')		{if(auxEn){this.score=[0,7];} else{this.score=[7,0];}}
	else if (action=='quiero-fe')			{if(auxEn){this.score=[0,x];} else{this.score=[y,0];}}	
	
	else if (action=='no-quiero-e')			{if(aux){this.score=[0,1];} else{this.score=[1,0];}}
	else if (action=='no-quiero-e-e')		{if(aux){this.score=[0,2];} else{this.score=[2,0];}}
	else if (action=='no-quiero-re')		{if(aux){this.score=[0,1];} else{this.score=[1,0];}}
	else if (action=='no-quiero-e-re')		{if(aux){this.score=[0,2];} else{this.score=[2,0];}}
	else if (action=='no-quiero-e-e-re')	{if(aux){this.score=[0,3];} else{this.score=[3,0];}}
	else if (action=='no-quiero-fe')		{if(aux){this.score=[0,1];} else{this.score=[1,0];}}
	
	else if (action=='no-quiero-t')		{if(aux){this.score=[0,1];} else{this.score=[1,0];}}
	else if (action=='no-quiero-rt')	{if(aux){this.score=[0,2];} else{this.score=[2,0];}}
	else if (action=='no-quiero-v4')	{if(aux){this.score=[0,3];} else{this.score=[3,0];}}
	
	else if (action=='play-card'){
		if(fsmCP.current=='p1-wins'){
			if(fsm.current=='quiero-t')			{if(aux2){this.score = [2, 0];}else{this.score = [0, 2];}}
			else if(fsm.current=='quiero-rt')	{if(aux2){this.score = [3, 0];}else{this.score = [0, 3];}}
			else if(fsm.current=='quiero-v4')	{if(aux2){this.score = [4, 0];}else{this.score = [0, 4];}}
			else 								{if(aux2){this.score = [1, 0];}else{this.score = [0, 1];}}
		}else if(fsmCP.current=='p2-wins'){
			if(fsm.current=='quiero-t')			{if(aux2){this.score = [0, 2];}else{this.score = [2, 0];}}
			else if(fsm.current=='quiero-rt')	{if(aux2){this.score = [0, 3];}else{this.score = [3, 0];}}
			else if(fsm.current=='quiero-v4')	{if(aux2){this.score = [0, 4];}else{this.score = [4, 0];}}
			else 								{if(aux2){this.score = [0, 1];}else{this.score = [1, 0];}}
		}
	}
	
	this.game.score[0] += this.score[0];
	this.game.score[1] += this.score[1];

	return this.score;
}

function makePlay(action,i,fsm,fsmCP,currentTurn){
	if(action=='play-card'){
		if(fsm.current=='init'){
			fsm[action]();
		}
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
	}else{
		fsm[action]();
	}
}

Round.prototype.checkStatus= function(fsmCP){
	if ((fsmCP.current=='p1-wins') || (fsmCP.current=='p2-wins') || (fsmCP.current=='no-quiero-t') ||
		(fsmCP.current=='no-quiero-rt') || (fsmCP.current=='no-quiero-v4') ){
		this.status='finished';
	}
};

/********************************************************/
Round.prototype.play = function(action, value,player) {
	// move to next states
	this.score=[0,0];
	makePlay(action,value,this.fsm,this.fsmCP,player);
	
	// check if is needed sum score
	this.calculateScore(action, this.fsm, this.fsmCP);

	//check status
	this.checkStatus(this.fsmCP);
	
	// Change player's turn
	return this.changeTurn(this.game);
	
	
};

module.exports.round = Round;
