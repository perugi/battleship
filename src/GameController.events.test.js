import Events from '@perugi/events';
import GameController from './GameController';
import GameState from './GameState';
import { countShips } from './testHelpers';

describe('GameController events API', () => {
  test('create the players after receiving the createPlayers event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    expect(gameController.getPlayers().length).toBe(2);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
  });

  test('Place a ship to player 1 after receiving the placeShip event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placeShip', {
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
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(1);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
  });

  test('Place random ships to player 1 after receiving the placeRandomShips event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placeRandomShips', {
      playerIndex: 0,
    });
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(5);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
  });

  test('Change the activePlayer after receiving after placingPlayer2 event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placingPlayer2');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[1],
      winner: null,
    });
  });

  test('Place a ship to player 2 after receiving the placeShip event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
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
      activePlayer: gameController.getPlayers()[1],
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(0);
    expect(countShips(gameController.getPlayers()[1])).toBe(1);
    expect(gameController.getPlayers()[1].getShips()[0][0].getLength()).toBe(2);
  });

  test('Place random ships to player 2 after receiving the placeRandomShips event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placingPlayer2');
    events.emit('placeRandomShips');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[1],
      winner: null,
    });
    expect(countShips(gameController.getPlayers()[0])).toBe(0);
    expect(countShips(gameController.getPlayers()[1])).toBe(5);
  });

  test('placingPlayer2 event does nothing in a single player game', () => {
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
    events.emit('placingPlayer2');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
  });

  test('start the game after receiving the startGame event in a single player game', () => {
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
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.shotReceived,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
  });

  test('start the game after receiving the startGame event in a 2-player game', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.shotReceived,
      shot: null,
      player1: gameController.getPlayers()[0],
      player2: gameController.getPlayers()[1],
      activePlayer: gameController.getPlayers()[0],
      winner: null,
    });
  });

  test('restart the game after receiving the restartGame event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('primeShot');
    events.emit('shoot', { x: 1, y: 1 });
    events.emit('restartGame');
    expect(fn).toHaveBeenLastCalledWith({
      gameState: GameState.placingShips,
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
      player2IsAi: false,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('primeShot');
    events.emit('shoot', { x: 0, y: 0 });
    expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);
    expect(fn).toHaveBeenCalledWith({
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
      player2IsAi: false,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('primeShot');
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

  test('when the game is over, this is reflected in the gameStateChange event', () => {
    const events = Events();
    const gameController = GameController(events);
    const fn = jest.fn();
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: false,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placingPlayer2');
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('placeShip', {
      shipLength: 1,
      x: 0,
      y: 2,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('primeShot');
    events.emit('shoot', { x: 0, y: 0 });
    events.emit('primeShot');
    events.emit('shoot', { x: 1, y: 0 });
    events.emit('primeShot');
    events.emit('shoot', { x: 0, y: 2 });
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
    events.on('gameStateChange', fn);
    events.emit('createPlayers', {
      player1Name: 'Player 1',
      player1IsAi: false,
      player2Name: 'Player 2',
      player2IsAi: true,
    });
    events.emit('placeShip', {
      shipLength: 2,
      x: 0,
      y: 0,
      direction: 'h',
    });
    events.emit('startGame');
    events.emit('primeShot');
    events.emit('shoot', { x: 5, y: 5 });
    expect(fn.mock.calls.length).toBe(6);
    events.emit('primeShot');
    events.emit('shoot');
    expect(fn.mock.calls.length).toBe(8);
  });
});
