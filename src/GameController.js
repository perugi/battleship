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
    [activePlayer] = players;

    gameState = GameState.placingShips;
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

  const placeShip = (playerIndex, shipLength, x, y, direction) => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placing ships state');
    if (
      !Number.isInteger(playerIndex) ||
      playerIndex < 0 ||
      playerIndex > players.length - 1
    )
      throw new Error('Invalid player index');

    players[playerIndex].placeShip(shipLength, x, y, direction);
    updateGameState();
  };

  const placeShipEvent = (data) => {
    placeShip(
      players.indexOf(activePlayer),
      data.shipLength,
      data.x,
      data.y,
      data.direction
    );
  };

  const placeRandomShips = (playerIndex) => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placing ships state');
    if (
      !Number.isInteger(playerIndex) ||
      playerIndex < 0 ||
      playerIndex > players.length - 1
    )
      throw new Error('Invalid player index');

    players[playerIndex].placeRandomShips(SHIP_LENGTHS);
    updateGameState();
  };

  const placeRandomShipsEvent = () => {
    placeRandomShips(players.indexOf(activePlayer));
  };

  const placingPlayer2Event = () => {
    if (gameState === GameState.placingShips && !players[1].getIsAi()) {
      [, activePlayer] = players;
      updateGameState();
    }
  };

  const startGame = () => {
    if (gameState !== GameState.placingShips)
      throw new Error('Not in placingShips state');

    if (players[1].getIsAi()) {
      placeRandomShips(1);
    }

    // We go to shotReceived and not shotPrimed, because we want the players to
    // go through the pass modal before seeing the board.
    gameState = GameState.shotReceived;
    [activePlayer] = players;
    updateGameState();
  };

  const primeShot = () => {
    if (gameState !== GameState.shotReceived)
      throw new Error('Not in shotReceived state');

    gameState = GameState.shotPrimed;
    updateGameState();
  };

  const shoot = (x, y) => {
    const shootingPlayer = activePlayer;
    let shipHit;
    let hitX;
    let hitY;

    if (x === null || y === null) {
      [shipHit, hitX, hitY] = activePlayer.shootAuto();
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

  const makeShot = (x = null, y = null) => {
    /* A human shot is represented by the presence of x and y.
    If x and y are not present, it is an AI shot. */

    if (gameState !== GameState.shotPrimed)
      throw new Error('Not primed for shot');

    gameState = GameState.shotReceived;
    shoot(x, y);

    if (checkIfGameOver()) {
      return true;
    }

    return false;
  };

  const shootEvent = (data = { x: null, y: null }) => {
    makeShot(data.x, data.y);
  };

  const restartGame = () => {
    createPlayers(
      players[0].getName(),
      players[0].getIsAi(),
      players[1].getName(),
      players[1].getIsAi()
    );
  };

  if (events) {
    events.on('createPlayers', createPlayersEvent);
    events.on('placeShip', placeShipEvent);
    events.on('placeRandomShips', placeRandomShipsEvent);
    events.on('startGame', startGame);
    events.on('restartGame', restartGame);
    events.on('primeShot', primeShot);
    events.on('shoot', shootEvent);
    events.on('placingPlayer2', placingPlayer2Event);
  }

  return {
    placeRandomShips,
    placeShip,
    createPlayers,
    startGame,
    primeShot,
    makeShot,
    restartGame,
    getPlayers: () => players,
    getActivePlayer: () => activePlayer,
    getWinner: () => winner,
    getGameState: () => gameState,
  };
};

export default GameController;
