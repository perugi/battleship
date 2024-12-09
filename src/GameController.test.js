import GameController from './GameController';
import GameState from './GameState';
import { countShips } from './testHelpers';

describe('GameController tests', () => {
  test('create a new game controller', () => {
    const gameController = GameController();
    expect(gameController.getGameState()).toBe(GameState.gameSetup);
  });

  test('create two players', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Computer', true);
    expect(gameController.getGameState()).toBe(GameState.placingShips);
    expect(gameController.getPlayers().length).toBe(2);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
    expect(gameController.getPlayers()[0].getIsAi()).toBe(false);
    expect(gameController.getPlayers()[0].getOpponent()).toBe(
      gameController.getPlayers()[1]
    );
    expect(gameController.getPlayers()[1].getName()).toBe('Computer');
    expect(gameController.getPlayers()[1].getIsAi()).toBe(true);
    expect(gameController.getPlayers()[1].getOpponent()).toBe(
      gameController.getPlayers()[0]
    );
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });

  test('creating players when players already exist clears the existing players', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.createPlayers('Player 3', true, 'Player 4', true);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 3');
    expect(gameController.getPlayers()[0].getIsAi()).toBe(true);
    expect(gameController.getPlayers()[1].getName()).toBe('Player 4');
    expect(gameController.getPlayers()[1].getIsAi()).toBe(true);
  });

  test('create two players and start a new single player game', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Computer', true);
    gameController.placeShip(0, 2, 0, 0, 'h');
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[1].getShips()[0][0]).toBe(null);
    gameController.placeShip(1, 2, 0, 0, 'h');
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[1].getShips()[0][0].getLength()).toBe(2);
    gameController.startGame();
    expect(gameController.getGameState()).toBe(GameState.gameStarted);
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });

  test('starting a game when not in placingShips state throws', () => {
    const gameController = GameController();
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
    gameController.playRound(0, 0);
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
    gameController.playRound(1, 0);
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
  });

  test('at restart, go back to ship placing with same players', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');

    gameController.startGame();
    gameController.playRound(1, 1);
    expect(gameController.getPlayers()[1].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[1].getShotsReceived()[1][1]).toBe(true);
    expect(gameController.getGameState()).toBe(GameState.shotReceived);

    gameController.restartGame();
    expect(gameController.getGameState()).toBe(GameState.placingShips);
    expect(gameController.getPlayers()[1].getShips()[0][0]).toBe(null);
    expect(gameController.getPlayers()[1].getShotsReceived()[1][1]).toBe(false);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 1');
    expect(gameController.getPlayers()[0].getIsAi()).toBe(false);
    expect(gameController.getPlayers()[1].getName()).toBe('Player 2');
    expect(gameController.getPlayers()[1].getIsAi()).toBe(false);
  });

  test('placing ships when not in placingShips state throws', () => {
    const gameController = GameController();
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
    gameController.playRound(0, 0);
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
    gameController.playRound(1, 0);
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
  });

  test('placing ships with an invalid player index throws', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.placeShip(-1, 2, 0, 0, 'h')).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeShip(3, 2, 0, 0, 'h')).toThrow(
      'Invalid player index'
    );
  });

  test('placing random ships to a specified player board', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeRandomShips(0);
    expect(countShips(gameController.getPlayers()[0])).toBe(5);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
    gameController.placeRandomShips(1);
    expect(countShips(gameController.getPlayers()[1])).toBe(5);
  });

  test('placing random ships when not in placing ships state throws', () => {
    const gameController = GameController();
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
    gameController.playRound(0, 0);
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
    gameController.playRound(1, 0);
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
  });

  test('placing random ships with an invalid player index throws', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.placeRandomShips(-1)).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeRandomShips(3)).toThrow(
      'Invalid player index'
    );
  });

  test('make a shot and hit the opponents ship', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
    expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(false);

    gameController.playRound(0, 0);
    expect(gameController.getGameState()).toBe(GameState.shotReceived);
    expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
    expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);

    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });

  test('make a shot and miss the opponents ship', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    gameController.playRound(9, 9);
    expect(gameController.getGameState()).toBe(GameState.shotReceived);
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[1]
    );
  });

  test('make a shot when the game is not active', () => {
    const gameController = GameController();
    expect(() => gameController.playRound(0, 0)).toThrow('Game not active');
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.playRound(0, 0)).toThrow('Game not active');
  });

  test('make a shot when the shot has not been primed', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    gameController.playRound(0, 0);
    expect(() => gameController.playRound(1, 0)).toThrow('Shot not primed');
  });

  test('sinking all the ships wins the game', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(0, 1, 0, 2, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.placeShip(1, 1, 0, 2, 'h');
    gameController.startGame();
    expect(gameController.getWinner()).toBe(null);
    expect(gameController.playRound(0, 0)).toBe(false);
    expect(gameController.getWinner()).toBe(null);
    expect(gameController.playRound(1, 0)).toBe(false);
    expect(gameController.getWinner()).toBe(null);
    expect(gameController.playRound(0, 2)).toBe(true);
    expect(gameController.getWinner()).toBe(gameController.getPlayers()[0]);
  });

  test('after winning the game, no more shots can be made', () => {
    expect.assertions(1);
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(0, 1, 0, 2, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.placeShip(1, 1, 0, 2, 'h');
    gameController.startGame();
    gameController.playRound(0, 0);
    gameController.playRound(1, 0);
    gameController.playRound(0, 2);
    expect(() => gameController.playRound(3, 0)).toThrow('Game not active');
  });
});
