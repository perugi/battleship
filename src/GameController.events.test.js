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
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);
});

test('when the active player changes, a playerChanged event is emitted', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('playerChanged', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  expect(fn).not.toHaveBeenCalled();
  events.emit('shoot', { x: 0, y: 1 });
  expect(fn).toHaveBeenCalledWith({
    activePlayer: gameController.getPlayers()[1],
  });
  events.emit('shoot', { x: 0, y: 1 });
  expect(fn).toHaveBeenCalledWith({
    activePlayer: gameController.getPlayers()[0],
  });
});

test('when the game is over, a gameOver event is emitted', () => {
  const events = Events();
  const gameController = GameController(events);
  const fn = jest.fn();
  events.on('gameOver', fn);
  events.emit('newGame', { playerName: 'Player 1' });
  events.emit('shoot', { x: 0, y: 0 });
  events.emit('shoot', { x: 1, y: 0 });
  expect(fn).not.toHaveBeenCalled();
  events.emit('shoot', { x: 2, y: 0 });
  expect(fn).toHaveBeenCalledWith({
    winner: gameController.getPlayers()[0],
  });
});
