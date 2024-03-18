import Events from '@perugi/events';
import GameController from './GameController';
import GameState from './GameState';
import { countShips, delay } from './testHelpers';

describe('test of GameController API using events', () => {
  test('create the players after receiving the createPlayers event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    expect(gameController.getPlayers().length).toBe(2);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: null,
      winner: null,
    });
  });

  test('Place a ship after receiving the placeShip event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: null,
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(1);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[0].getShips()[1][0]).toBe(null);
  });

  test('Place random ships after receiving the placeRandomShips event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeRandomShips', {
      playerIndex: 0,
    });
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: null,
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(5);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
  });

  test('start the game after receiving the startGame event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    expect(fn).toHaveBeenLastCalledWith({
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
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      playerIndex: 1,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
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
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      playerIndex: 1,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('shoot', { x: 0, y: 1 });
    expect(gameController.getPlayers()[1].getShotsReceived()[1][0]).toBe(true);
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

  test('when the game is over, this is reflected in the gameStateChange event', async () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      playerIndex: 1,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      playerIndex: 1,
      shipLength: 1,
      x: 2,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('shoot', { x: 0, y: 0 });
    await delay(0);
    events.emit('shoot', { x: 1, y: 0 });
    await delay(0);
    events.emit('shoot', { x: 2, y: 0 });
    await delay(0);
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.gameOver,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: null,
      winner: gameController.getPlayers()[0],
    });
  });

  test('AI plays after the player misses', async () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      playerIndex: 0,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      playerIndex: 1,
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('shoot', { x: 5, y: 5 });
    await delay(1100);
    expect(fn.mock.calls.length).toBeGreaterThan(1);
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });
});
