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
	var fsm = StateMachine.create({			//defines state in terms of chants made
		initial: 'init',
		events: 
			[
			 { name: 'envido',    		from: ['init','trucoNE'],				to: 'envido' },
			 { name: 'envido',    		from: ['envido'],					to: 'envido-e' },
			 { name: 'real-envido',		from: ['init','trucoNE'],				to: 'real-envido' },
			 { name: 'real-envido',    	from: ['envido'],					to: 'envido-re' },
			 { name: 'real-envido',    	from: ['envido-e'],					to: 'envido-e-re' },
			 { name: 'f-envido',    	from: ['init','envido',
			 									'real-envido',
			                        	       'envido-e','envido-re',
			                        	       'envido-e-re','trucoNE'],		to: 'f-envido'},
			 { name: 'quiero',    		from: ['envido'],        			to: 'quiero-e'  },
			 { name: 'quiero',    		from: ['envido-e'],        			to: 'quiero-e-e'  },
			 { name: 'quiero',    		from: ['real-envido'],        		to: 'quiero-re'  },
			 { name: 'quiero',    		from: ['envido-re'],        		to: 'quiero-e-re'  },
			 { name: 'quiero',  		from: ['envido-e-re'],     			to: 'quiero-e-e-re'  },
			 { name: 'quiero',    		from: ['f-envido'],        			to: 'quiero-fe'  },
			 
			 { name: 'no-quiero',    	from: ['envido'],        			to: 'no-quiero-e'  },
			 { name: 'no-quiero',  		from: ['envido-e'],        			to: 'no-quiero-e-e'  },
			 { name: 'no-quiero',   	from: ['real-envido'],        		to: 'no-quiero-re'  },
			 { name: 'no-quiero', 		from: ['envido-re'],        		to: 'no-quiero-e-re'  },
			 { name: 'no-quiero',		from: ['envido-e-re'],     			to: 'no-quiero-e-e-re'  },
			 { name: 'no-quiero',    	from: ['f-envido'],        			to: 'no-quiero-fe'  },
			 { name: 'truco', 			from: 'init',     					to: 'trucoNE' },
			 { name: 'truco',     		from: ['quiero-e',
			                      		       'no-quiero-e','quiero-e-e',
			                      		       'quiero-re','quiero-e-re',
			                      		       'quiero-e-e-re','quiero-fe',
			                      		       'no-quiero-e-e','no-quiero-re',
			                      		       'no-quiero-e-re','no-quiero-e-e-re',
			                      		       'no-quiero-fe'],      		to: 'truco'  },
			 { name: 'quiero', 			from: ['trucoNE','truco'],          to: 'quiero-t' },
			 { name: 'no-quiero', 		from: ['truco'],              		to: 'no-quiero-t' },
			 { name: 'retruco', 		from: ['truco','quiero-t',
			 									'trucoNE'], 				to: 'retruco' },
			 { name: 'no-quiero', 		from: ['retruco'],              	to: 'no-quiero-rt' },
			 { name: 'quiero', 			from: ['retruco'],              	to: 'quiero-rt' },
			 { name: 'vale4', 			from: ['retruco','quiero-rt'],      to: 'vale4' },
			 { name: 'no-quiero', 		from: ['vale4'],              		to: 'no-quiero-v4' },
			 { name: 'quiero', 			from: ['vale4'],	              	to: 'quiero-v4' },
			 
		]});
	return fsm;
};

function newPlayedFSM(){				//defines state in terms of playing cards
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
};

function Round(game,turn){
	//Game
	this.game = game;

	this.game.player1.allowed=true;
    this.game.player2.allowed=true;
	//next turn
	this.currentHand = turn;
	this.currentTurn = turn;

	//FSMs to perform user's actions
	this.fsm = newTrucoFSM();
	this.fsmCP = newPlayedFSM();
	this.auxCard = undefined;

	//Round's score
	this.score = [0, 0];
	this.status='running';

	this.noQuieroF=1;
	this.board1=[];
	this.board2=[];
};

/* Generates a new deck shuffled and gives to players the correspondent cards */
Round.prototype.deal = function(){
	var deck = new Deck().mix();
  	this.game.player1.setCards(_.pullAt(deck, 0, 2, 4));
  	this.game.player2.setCards(_.pullAt(deck, 1, 3, 5));
};

Round.prototype.changeTurn = function(game,action){
	if (action=='play-card' &&(this.fsmCP.current=='p2-won-1st' || this.fsmCP.current=='1vs1-1' || this.fsmCP.current=='1vs1-2')){
		return this.currentTurn;
	}
	else{
		return this.currentTurn = this.switchPlayer(this.currentTurn,this.game);
	}
};

/* returns the opposite player */
Round.prototype.switchPlayer=function (player,game) {
	if(player==game.player1){
		return game.player2;
	}
	else{
		return game.player1;
	}
};

Round.prototype.calculateScore = function(action,fsm,fsmCP){
	aux  = (this.currentTurn==this.game.player1);
	aux2 = (this.currentHand==this.game.player1);
	auxEn =	this.game.player1.envidoPoints<this.game.player2.envidoPoints;
	x=30-this.game.score[0];		//lacking points to j1 wining
	y=30-this.game.score[1];		//lacking points to j2 wining
	var scoreX=[0,0];
	if(action=='quiero'){		//calculates score of a quiero
		if(fsm.current == 'quiero-e')					{if(auxEn){scoreX=[0,2];} else{scoreX=[2,0];}}
		else if (fsm.current=='quiero-e-e')				{if(auxEn){scoreX=[0,4];} else{scoreX=[4,0];}}
		else if (fsm.current=='quiero-re')				{if(auxEn){scoreX=[0,3];} else{scoreX=[3,0];}}
		else if (fsm.current=='quiero-e-re')			{if(auxEn){scoreX=[0,5];} else{scoreX=[5,0];}}
		else if (fsm.current=='quiero-e-e-re')			{if(auxEn){scoreX=[0,7];} else{scoreX=[7,0];}}
		else if (fsm.current=='quiero-fe')				{if(auxEn){scoreX=[0,x];} else{scoreX=[y,0];}}	
	}
	else if(action=='no-quiero'){ //calculates score of a no quiero
		if (fsm.current=='no-quiero-e')					{if(aux){scoreX=[0,1];} else{scoreX=[1,0];}}
		else if (fsm.current=='no-quiero-e-e')			{if(aux){scoreX=[0,2];} else{scoreX=[2,0];}}
		else if (fsm.current=='no-quiero-re')			{if(aux){scoreX=[0,1];} else{scoreX=[1,0];}}
		else if (fsm.current=='no-quiero-e-re')			{if(aux){scoreX=[0,2];} else{scoreX=[2,0];}}
		else if (fsm.current=='no-quiero-e-e-re')		{if(aux){scoreX=[0,3];} else{scoreX=[3,0];}}
		else if (fsm.current=='no-quiero-fe')			{if(aux){scoreX=[0,this.noQuieroF];} else{scoreX=[this.noQuieroF,0];}}
		else if (fsm.current=='no-quiero-t')			{if(aux){scoreX=[0,1];} else{scoreX=[1,0];}}
		else if (fsm.current=='no-quiero-rt')			{if(aux){scoreX=[0,2];} else{scoreX=[2,0];}}
		else if (fsm.current=='no-quiero-v4')			{if(aux){scoreX=[0,3];} else{scoreX=[3,0];}}
	}
	else if (action=='play-card'){//calculates score of an ending round by a card played
		if(fsmCP.current=='p1-wins'){
			if(fsm.current=='quiero-t')			{if(aux2){scoreX=[2,0];} else{scoreX=[0,2];}}
			else if(fsm.current=='quiero-rt')	{if(aux2){scoreX=[3,0];} else{scoreX=[0,3];}}
			else if(fsm.current=='quiero-v4')	{if(aux2){scoreX=[4,0];} else{scoreX=[0,4];}}
			else 								{if(aux2){scoreX=[1,0];} else{scoreX=[0,1];}}
		}else if(fsmCP.current=='p2-wins'){
			if(fsm.current=='quiero-t')			{if(aux2){scoreX=[0,2];} else{scoreX=[2,0];}}
			else if(fsm.current=='quiero-rt')	{if(aux2){scoreX=[0,3];} else{scoreX=[3,0];}}
			else if(fsm.current=='quiero-v4')	{if(aux2){scoreX=[0,4];} else{scoreX=[4,0];}}
			else 								{if(aux2){scoreX=[0,1];} else{scoreX=[1,0];}}
		}
	}
	
	this.score[0] += scoreX[0];		//adds score to the game itself
	this.score[1] += scoreX[1];
	
	this.game.score[0] += scoreX[0];
	this.game.score[1] += scoreX[1];

	return this.score;
};

Round.prototype.makePlay = function (action,i,fsm,fsmCP,currentTurn){
	if(action=='play-card'){
		if (currentTurn==this.game.player1){
			this.board1.push(this.game.player1.cards[i]);
		}else{
			this.board2.push(this.game.player2.cards[i]);
		}
		if (this.auxCard == undefined){
			fsmCP['play-card']();
			this.auxCard = currentTurn.cards[i];
		} else if(currentTurn.cards[i].confront(this.auxCard)==1){//last played card defeats aux
			fsmCP['play-card-w']();
			this.auxCard = undefined;
		} else if(currentTurn.cards[i].confront(this.auxCard)==0){//last played card same weight as aux
			fsmCP['play-card-s']();
			this.auxCard = undefined;
		} else if(currentTurn.cards[i].confront(this.auxCard)==-1){//last played card defeated by aux
			fsmCP['play-card-l']();
			this.auxCard = undefined;
		}
		delete currentTurn.cards[i];
	}else{
		fsm[action]();								//applies action to fsm
		if(action=='no-quiero'){					//checks who's allowed to chant in the next turn
			currentTurn.allowed=true;
			this.switchPlayer(currentTurn,this.game).allowed=true;
		}else if (action=='quiero'){
			if (fsm.current!='quiero-t'&& (fsm.current!='quiero-rt' && fsm.current!='quiero-v4')){
				currentTurn.allowed=true;
				this.switchPlayer(currentTurn,this.game).allowed=true;
			}
		}else{
			currentTurn.allowed=false;
			this.switchPlayer(currentTurn,this.game).allowed=true;
		}		
	}
};

Round.prototype.checkStatus= function(fsmCP,fsm){
	if ((fsmCP.current=='p1-wins') || (fsmCP.current=='p2-wins') || (fsm.current=='no-quiero-t') ||
		(fsm.current=='no-quiero-rt') || (fsm.current=='no-quiero-v4') ){
		this.status='finished';
	}
};

/********************************************************/
Round.prototype.play = function(action, value,player) {
	// move to next states
	this.makePlay(action,value,this.fsm,this.fsmCP,player);
	
	// check if is needed sum score
	this.calculateScore(action, this.fsm, this.fsmCP);

	//check status
	this.checkStatus(this.fsmCP,this.fsm);
	
	// Change player's turn
	return this.changeTurn(this.game, action);
	
	
};

module.exports.round = Round;