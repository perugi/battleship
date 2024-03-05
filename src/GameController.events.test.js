import Events from '@perugi/events';
import GameController from './GameController';

test('start a new game after receiving a newGame event', () => {
  const events = Events();
  const gameController = GameController(events);
  events.emit('newGame', { playerName: 'Player 1' });
  expect(gameController.getPlayers().length).toBe(2);
  expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
});

test('make a shot after receiving a shoot event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);
  expect(fn).toHaveBeenCalledWith({
    gameState: 'gameInProgress',
    shot: { x: 0, y: 0 },
    shipHit: true,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[0],
    winner: null,
  });
});

test('when the game start, a gameStarted event is emitted', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  expect(fn).toHaveBeenCalledWith({
    gameState: 'gameInProgress',
    shot: null,
    shipHit: null,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[0],
    winner: null,
  });
});

test('when the active player changes, this is reflected in the shotReceived event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 1 });
  expect(fn).toHaveBeenCalledWith({
    gameState: 'gameInProgress',
    shot: { x: 0, y: 1 },
    shipHit: false,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[1],
    winner: null,
  });
});

test('when the game is over, this is reflected in the shotReceived event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStateChange', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  events.emit('shoot', { x: 1, y: 0 });
  events.emit('shoot', { x: 2, y: 0 });
  expect(fn).toHaveBeenCalledWith({
    gameState: 'gameOver',
    shot: { x: 2, y: 0 },
    shipHit: true,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: null,
    winner: gameController.getPlayers()[0],
  });
});
