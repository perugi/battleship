import Player from './Player';
import GameState from './GameState';

const GameController = (events) => {
  let players = [];
  let activePlayer = null;
  let winner = null;
  let gameState = GameState.notStarted;

  const updateGameState = (shot) => {
    if (events) {
      events.emit('gameStateChange', {
        gameState,
        shot: shot ?? null,
        player1: players[0],
        player2: players[1],
        activePlayer,
        winner,
      });
    }
  };

  const newGame = (player1Name, player1IsAi, player2Name, player2IsAi) => {
    winner = null;
    players = [];
    players.push(Player(player1Name, player1IsAi));
    players.push(Player(player2Name, player2IsAi));
    players[0].setOpponent(players[1]);
    players[1].setOpponent(players[0]);
    [activePlayer] = players;

    // TODO implement a mechanism to position the ships. For now, just
    // place the ships on the board automatically
    players[0].placeShip(1, 0, 0, 'v');
    players[0].placeShip(2, 1, 0, 'h');
    players[1].placeShip(1, 0, 0, 'v');
    players[1].placeShip(2, 1, 0, 'h');

    gameState = GameState.gameStarted;
    updateGameState();
  };

  const newGameEvent = (data) => {
    newGame(
      data.player1Name,
      data.player1IsAi,
      data.player2Name,
      data.player2IsAi
    );
  };

  const shoot = async (x, y) => {
    const shootingPlayer = activePlayer;
    let shipHit;
    let hitX;
    let hitY;

    if (activePlayer.getIsAi()) {
      [shipHit, hitX, hitY] = await activePlayer.shootAuto();
    } else {
      [shipHit, hitX, hitY] = activePlayer.shoot(x, y);
    }

    if (!shipHit) {
      activePlayer = activePlayer.getOpponent();
    }

    updateGameState({
      shootingPlayer,
      shipHit,
      x: hitX,
      y: hitY,
    });
  };

  const checkIfGameOver = () => {
    if (activePlayer.getOpponent().allSunk()) {
      gameState = GameState.gameOver;
      winner = activePlayer;
      activePlayer = null;

      updateGameState();

      return true;
    }
    return false;
  };

  const playRound = async (x, y) => {
    /* 
    A round represents a single human player action (shot).
    This has different consequence in single player and multiplayer:
      - In a single player game against a computer, a round represents a player shot and,
      if it is a miss, all computer shots until the computer misses. If the first player shot
      is a hit, the round is over and the next shot represents a new round.
      - In a multiplayer game, a round is always a single shot, either a hit or a miss.
    If at any stage the game is over, the round terminates and the function returns true;
    */

    if (gameState === GameState.notStarted || gameState === GameState.gameOver)
      throw new Error('Game not active');

    gameState = GameState.shotReceived;

    await shoot(x, y);

    if (checkIfGameOver()) {
      return true;
    }

    while (activePlayer.getIsAi()) {
      await shoot();

      if (checkIfGameOver()) {
        return true;
      }
    }

    return false;
  };

  const shootEvent = async (data) => {
    await playRound(data.x, data.y);
  };

  if (events) {
    events.on('newGame', newGameEvent);
    events.on('shoot', shootEvent);
  }

  return {
    newGame,
    playRound,
    getPlayers: () => players,
    getActivePlayer: () => activePlayer,
    getWinner: () => winner,
  };
};

export default GameController;
