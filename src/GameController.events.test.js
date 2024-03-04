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
  events.on('shotReceived', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  expect(fn).not.toHaveBeenCalled();
  events.emit('shoot', { x: 0, y: 0 });
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);
  expect(fn).toHaveBeenCalledWith({
    shot: { x: 0, y: 0 },
    shipHit: true,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[0],
    ships1: gameController.getPlayers()[0].getShips(),
    ships2: gameController.getPlayers()[1].getShips(),
    shotsReceived1: gameController.getPlayers()[0].getShotsReceived(),
    shotsReceived2: gameController.getPlayers()[1].getShotsReceived(),
    winner: null,
  });
});

test('when the game start, a gameStarted event is emitted', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameStarted', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  expect(fn).toHaveBeenCalledWith({
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
  });
});

test('when the active player changes, this is reflected in the shotReceived event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('shotReceived', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 1 });
  expect(fn).toHaveBeenCalledWith({
    shot: { x: 0, y: 1 },
    shipHit: false,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: gameController.getPlayers()[1],
    ships1: gameController.getPlayers()[0].getShips(),
    ships2: gameController.getPlayers()[1].getShips(),
    shotsReceived1: gameController.getPlayers()[0].getShotsReceived(),
    shotsReceived2: gameController.getPlayers()[1].getShotsReceived(),
    winner: null,
  });
});

test('when the game is over, this is reflected in the shotReceived event', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('shotReceived', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  events.emit('shoot', { x: 1, y: 0 });
  events.emit('shoot', { x: 2, y: 0 });
  expect(fn).toHaveBeenCalledWith({
    shot: { x: 2, y: 0 },
    shipHit: true,
    player1: gameController.getPlayers()[0],
    player2: gameController.getPlayers()[1],
    activePlayer: null,
    ships1: gameController.getPlayers()[0].getShips(),
    ships2: gameController.getPlayers()[1].getShips(),
    shotsReceived1: gameController.getPlayers()[0].getShotsReceived(),
    shotsReceived2: gameController.getPlayers()[1].getShotsReceived(),
    winner: gameController.getPlayers()[0],
  });
});
