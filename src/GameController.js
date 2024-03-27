import Player from './Player';
import GameState from './GameState';

const GameController = (events) => {
  let players = [];
  let activePlayer = null;
  let winner = null;
  let gameState = GameState.gameSetup;

  const SHIP_LENGTHS = [5, 4, 3, 3, 2];

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

  const placingPlayer2Event = () => {
    if (gameState === GameState.placingShips && !players[1].getIsAi()) {
      activePlayer = players[1];
      updateGameState();
    }
  };

  const placeShip = (playerIndex, shipLength, x, y, direction) => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placing ships state');
    if (playerIndex < 0 || playerIndex > players.length - 1)
      throw new Error('Invalid player index');

    players[playerIndex].placeShip(shipLength, x, y, direction);
    updateGameState();
  };

  const placeShipEvent = (data) => {
    placeShip(players.indexOf(activePlayer), data.shipLength, data.x, data.y, data.direction);
  };

  const placeRandomShips = (playerIndex) => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placing ships state');
    if (playerIndex < 0 || playerIndex > players.length - 1)
      throw new Error('Invalid player index');

    players[playerIndex].placeRandomShips(SHIP_LENGTHS);
    updateGameState();
  };

  const placeRandomShipsEvent = () => {
    placeRandomShips(players.indexOf(activePlayer));
  };

  const createPlayers = (
    player1Name,
    player1IsAi,
    player2Name,
    player2IsAi
  ) => {
    winner = null;
    players = [];
    players.push(Player(player1Name, player1IsAi));
    players.push(Player(player2Name, player2IsAi));
    players[0].setOpponent(players[1]);
    players[1].setOpponent(players[0]);
    activePlayer = players[0];

    gameState = GameState.placingShips;
    updateGameState();
  };

  const startGame = () => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placingShips state');

    if (players[1].getIsAi()) {
      placeRandomShips(1);
    }

    gameState = GameState.gameStarted;
    [activePlayer] = players;
    updateGameState();
  };

  const createPlayersEvent = (data) => {
    createPlayers(
      data.player1Name,
      data.player1IsAi,
      data.player2Name,
      data.player2IsAi
    );
  };

  const restartGame = () => {
    gameState = GameState.placingShips;
    players[0].clearShotsReceived();
    players[1].clearShotsReceived();

    startGame();
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
      gameState = GameState.gameSetup;

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

    if (
      gameState !== GameState.gameStarted &&
      gameState !== GameState.shotReceived
    )
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
    events.on('createPlayers', createPlayersEvent);
    events.on('placeShip', placeShipEvent);
    events.on('placeRandomShips', placeRandomShipsEvent);
    events.on('startGame', startGame);
    events.on('restartGame', restartGame);
    events.on('shoot', shootEvent);
    events.on('placingPlayer2', placingPlayer2Event);
  }

  return {
    placeRandomShips,
    placeShip,
    createPlayers,
    startGame,
    restartGame,
    playRound,
    getPlayers: () => players,
    getActivePlayer: () => activePlayer,
    getWinner: () => winner,
    getGameState: () => gameState,
  };
};

export default GameController;
