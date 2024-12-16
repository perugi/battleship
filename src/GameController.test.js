import GameController from './GameController';
import GameState from './GameState';
import { countHitsOnBoard, countShips } from './testHelpers';

describe('GameController tests', () => {
  it('instantiates with default game setup', () => {
    const gameController = GameController();
    expect(gameController.getGameState()).toBe(GameState.gameSetup);
    expect(gameController.getPlayers().length).toBe(0);
    expect(gameController.getWinner()).toBe(null);
    expect(gameController.getActivePlayer()).toBe(null);
  });

  it('creates two players', () => {
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

  it('clears the existing players when creating players', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.createPlayers('Player 3', true, 'Player 4', true);
    expect(gameController.getPlayers()[0].getName()).toBe('Player 3');
    expect(gameController.getPlayers()[0].getIsAi()).toBe(true);
    expect(gameController.getPlayers()[1].getName()).toBe('Player 4');
    expect(gameController.getPlayers()[1].getIsAi()).toBe(true);
  });

  it('starts a new single player game after creating two players', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Computer', true);
    gameController.placeShip(0, 2, 0, 0, 'h');
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[1].getShips()[0][0]).toBe(null);
    gameController.placeShip(1, 2, 0, 0, 'h');
    expect(gameController.getPlayers()[0].getShips()[0][0].getLength()).toBe(2);
    expect(gameController.getPlayers()[1].getShips()[0][0].getLength()).toBe(2);
    gameController.startGame();
    expect(gameController.getGameState()).toBe(GameState.shotReceived);
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });

  it('throws when starting a game when not in placingShips state', () => {
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
    gameController.primeShot();
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
    gameController.makeShot(0, 0);
    expect(() => gameController.startGame()).toThrow(
      'Not in placingShips state'
    );
  });

  it('goes back to ship placing with same players at restart', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');

    gameController.startGame();
    gameController.primeShot();
    gameController.makeShot(1, 1);
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

  it('throws when placing ships when not in placingShips state', () => {
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
    gameController.primeShot();
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
    gameController.makeShot(0, 0);
    expect(() => gameController.placeShip(0, 2, 0, 0, 'h')).toThrow(
      'Not in placing ships state'
    );
  });

  it('throws when placing ships with an invalid player', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.placeShip('a', 2, 0, 0, 'h')).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeShip(-1, 2, 0, 0, 'h')).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeShip(3, 2, 0, 0, 'h')).toThrow(
      'Invalid player index'
    );
  });

  it('places random ships to a specified player board', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeRandomShips(0);
    expect(countShips(gameController.getPlayers()[0])).toBe(5);
    expect(countShips(gameController.getPlayers()[1])).toBe(0);
    gameController.placeRandomShips(1);
    expect(countShips(gameController.getPlayers()[1])).toBe(5);
  });

  it('throws when placing random ships when not in placing ships state', () => {
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
    gameController.primeShot();
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
    gameController.makeShot(0, 0);
    expect(() => gameController.placeRandomShips([1])).toThrow(
      'Not in placing ships state'
    );
  });

  it('throws when placing random ships with an invalid player index', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.placeRandomShips('a')).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeRandomShips(-1)).toThrow(
      'Invalid player index'
    );
    expect(() => gameController.placeRandomShips(3)).toThrow(
      'Invalid player index'
    );
  });

  it('throws when priming a shot when not in shotReceived state', () => {
    const gameController = GameController();
    expect(() => gameController.primeShot()).toThrow(
      'Not in shotReceived state'
    );
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.primeShot()).toThrow(
      'Not in shotReceived state'
    );
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    gameController.primeShot();
    expect(() => gameController.primeShot()).toThrow(
      'Not in shotReceived state'
    );
  });

  it('allows the player to make a shot, hitting the opponents ship', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
    expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(false);
    gameController.primeShot();
    expect(gameController.getGameState()).toBe(GameState.shotPrimed);
    gameController.makeShot(0, 0);
    expect(gameController.getGameState()).toBe(GameState.shotReceived);
    expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
    expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);

    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[0]
    );
  });

  it('allows the player to make a shot, missing the opponents ship', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    gameController.primeShot();
    gameController.makeShot(9, 9);
    expect(gameController.getGameState()).toBe(GameState.shotReceived);
    expect(gameController.getActivePlayer()).toBe(
      gameController.getPlayers()[1]
    );
    expect(countHitsOnBoard(gameController.getPlayers()[0])).toBe(0);
    expect(countHitsOnBoard(gameController.getPlayers()[1])).toBe(1);
  });

  it('makes AI shot after the player misses', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', true);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    while (
      gameController.getActivePlayer() === gameController.getPlayers()[0]
    ) {
      // make random shots until the player misses
      gameController.primeShot();
      gameController.makeShot();
    }
    // computer makes a random shot
    gameController.primeShot();
    gameController.makeShot();
    expect(countHitsOnBoard(gameController.getPlayers()[0])).toBe(1);
  });

  it('throws when making a shot when the controller is not waiting for shot', () => {
    const gameController = GameController();
    expect(() => gameController.makeShot(0, 0)).toThrow('Not primed for shot');
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    expect(() => gameController.makeShot(0, 0)).toThrow('Not primed for shot');
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.startGame();
    expect(() => gameController.makeShot(1, 0)).toThrow('Not primed for shot');
  });

  it('gets winner after sinking all the ships', () => {
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(0, 1, 0, 2, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.placeShip(1, 1, 0, 2, 'h');
    gameController.startGame();
    expect(gameController.getWinner()).toBe(null);
    gameController.primeShot();
    expect(gameController.makeShot(0, 0)).toBe(false);
    expect(gameController.getWinner()).toBe(null);
    gameController.primeShot();
    expect(gameController.makeShot(1, 0)).toBe(false);
    expect(gameController.getWinner()).toBe(null);
    gameController.primeShot();
    expect(gameController.makeShot(0, 2)).toBe(true);
    expect(gameController.getWinner()).toBe(gameController.getPlayers()[0]);
  });

  it('throws when shooting after winning the game', () => {
    expect.assertions(2);
    const gameController = GameController();
    gameController.createPlayers('Player 1', false, 'Player 2', false);
    gameController.placeShip(0, 2, 0, 0, 'h');
    gameController.placeShip(0, 1, 0, 2, 'h');
    gameController.placeShip(1, 2, 0, 0, 'h');
    gameController.placeShip(1, 1, 0, 2, 'h');
    gameController.startGame();
    gameController.primeShot();
    gameController.makeShot(0, 0);
    gameController.primeShot();
    gameController.makeShot(1, 0);
    gameController.primeShot();
    gameController.makeShot(0, 2);
    expect(() => gameController.primeShot()).toThrow(
      'Not in shotReceived state'
    );
    expect(() => gameController.makeShot(3, 0)).toThrow('Not primed for shot');
  });
});
