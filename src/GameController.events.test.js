import Events from '@perugi/events';
import GameController from './GameController';
import GameState from './GameState';

test('start a new game after receiving a newGame event', () => {
  const events = Events();
  const gameController = GameController(events);
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: true,
  });
  expect(gameController.getPlayers().length).toBe(2);
  expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
});

test('update the game state after receiving the newGame event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: true,
  });
  expect(fn).toHaveBeenCalledWith({
    gameState: GameState.gameStarted,
    shot: null,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[0],
    winner: null,
  });
});

test('when a shot hits, this is reflected in the gameStateChange event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: false,
  });
  events.emit('shoot', { x: 0, y: 0 });
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);
  expect(fn).toHaveBeenLastCalledWith({
    gameState: GameState.shotReceived,
    shot: {
      shootingPlayer: gameController.getPlayers()[0],
      shipHit: true,
      x: 0,
      y: 0,
    },
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[0],
    winner: null,
  });
});

test('when a shot misses, this is reflected in the gameStateChange event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: false,
  });
  events.emit('shoot', { x: 0, y: 1 });
  expect(fn).toHaveBeenLastCalledWith({
    gameState: GameState.shotReceived,
    shot: {
      shootingPlayer: gameController.getPlayers()[0],
      shipHit: false,
      x: 0,
      y: 1,
    },
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[1],
    winner: null,
  });
});

test('when the game is over, this is reflected in the gameStateChange event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: false,
  });
  events.emit('shoot', { x: 0, y: 0 });
  events.emit('shoot', { x: 1, y: 0 });
  events.emit('shoot', { x: 2, y: 0 });
  expect(fn).toHaveBeenLastCalledWith({
    gameState: GameState.gameOver,
    shot: null,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: null,
    winner: gameController.getPlayers()[0],
  });
});

test('AI plays after the player misses', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.emit('newGame', {
    player1Name: 'Player 1',
    player1IsAi: false,
    player2Name: 'Player 2',
    player2IsAi: true,
  });
  events.on('gameStateChange', fn);
  events.emit('shoot', { x: 5, y: 5 });
  expect(fn.mock.calls.length).toBeGreaterThan(1);
  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[0]);
});
