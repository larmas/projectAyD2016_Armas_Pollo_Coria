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

function newTrucoFSM(){
  var fsm = StateMachine.create({
  initial: 'init',
  events: [
    { name: 'play card',  from: 'init',               to: 'first-card' },
    { name: 'envido',     from: ['init', 'first-card'],   to: 'envido' },
    { name: 'quiero-e',     from: ['envido'],             to: 'quiero-e'  },
    { name: 'no-quiero-e',  from: ['envido'],                 to: 'no-quiero-e'  },
    { name: 'truco',      from: ['init', 'first-card',
                                 'played-card','quiero-e',
                                 'no-quiero-e'],          to: 'truco'  },
    { name: 'quiero-t',   from: ['truco'],                  to: 'quiero-t' },
    { name: 'no-quiero-t',  from: ['truco'],                  to: 'no-quiero-t' },
    { name: 'play-card',  from: ['quiero-e', 'no-quiero-e',
                                 'first-card', 'played-card'],to: 'played-card' },
    { name: 'play-card',  from: ['quiero-t'],               to: 'play-card-t' },
  ]});

  return fsm;
}


function Round(game,turn,roundN){
  /*
   * Game
   */
  this.game = game;
  /*
   * next turn
   */
  this.currentTurn = turn;

  /*
   * here is a FSM to perform user's actions
   */
  this.fsm = newTrucoFSM();

  /*
   *
   */
  this.status = 'running';
  
  this.nHand = roundN;
  /*
   * Round' score
   */
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

Round.prototype.changeTurn = function(){
  if(this.currentTurn.wonH.contains(this.nHand)){
    return this.currentTurn;
  }else{
     return this.currentTurn = switchPlayer(this.currentTurn);
  }
}
/*
 * returns the oposite player
 */
function switchPlayer(player) {
  return "player1" === player ? "player2" : "player1";
};

Round.prototype.calculateScore = function(action){
  if(action == 'quiero-e'){
    if (this.game.player1.envidoPoints<this.game.player2.envidoPoints){
      this.score = [0, 2];
    }else{
      this.score = [2, 0];
    }
  }else if (action=='no-quiero-e'){
    this.score[1,0];
  }else if(action=='no-quiero-t'){
    this.score[1,0];
  }else if(action=='play-card' && tsm=='play-card-t' && game.noCL()){
    if(game.player1.wonH.size()>=game.player2.wonH.size()){
      this.score[2,0];
    }
  }else if(action=='play-card' && tsm=='played-card' && game.noCL()){
    if(game.player1.wonH.size()>=game.player2.wonH.size()){
      this.score[1,0];
    }
  }else{
    this.score[0,0];
  }
  this.game.score[0] += this.score[0];
  this.game.score[1] += this.score[1];

  return this.score;
}

function makePlay(action,i){
  if(action=='play-card'){
    this.currentTurn.cards.remove(i);
  }
}

/*
 * Let's Play :)
 */
Round.prototype.play = function(action, value) {
  // move to the next state
  this.fsm[action]();
  this.makePlay();
  // check if is needed sum score
  this.calculateScore(action);

  // Change player's turn
  return this.changeTurn();
};

module.exports.round = Round;
