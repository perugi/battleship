import GameController from './GameController';
import GameState from './GameState';

test('create a new game controller', () => {
  const gameController = GameController();
  expect(gameController.getGameState()).toBe(GameState.gameSetup);
});

test('create two players', () => {
  const gameController = GameController();
  gameController.createPlayers('Player 1', false, 'Player 2', false);
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
  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[0]);
  expect(gameController.getActivePlayer()).toBe(null);
});

test('create two players and start a new game', () => {
  const gameController = GameController();
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  gameController.placeShip(0, 2, 0, 0, 'h');
  gameController.placeShip(1, 2, 0, 0, 'h');
  gameController.startGame();
  expect(gameController.getGameState()).toBe(GameState.gameStarted);
  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[0]);
});

test.skip('placing ships when not in placing ships state throws', () => {});

test('make a shot and hit the opponents ship', async () => {
  const gameController = GameController();
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  gameController.placeShip(0, 2, 0, 0, 'h');
  gameController.placeShip(1, 2, 0, 0, 'h');
  gameController.startGame();
  expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(false);

  await gameController.playRound(0, 0);
  expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);

  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[0]);
});

test('make a shot and miss the opponents ship', async () => {
  const gameController = GameController();
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  gameController.placeShip(0, 2, 0, 0, 'h');
  gameController.placeShip(1, 2, 0, 0, 'h');
  gameController.startGame();
  await gameController.playRound(9, 9);
  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[1]);
});

test('make a shot when the game is not active', async () => {
  expect.assertions(1);
  const gameController = GameController();
  try {
    await gameController.playRound(0, 0);
  } catch (error) {
    expect(error.message).toBe('Game not active');
  }
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  try {
    await gameController.playRound(0, 0);
  } catch (error) {
    expect(error.message).toBe('Game not active');
  }
});

test('sinking all the ships wins the game', async () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  gameController.placeShip(0, 2, 0, 0, 'h');
  gameController.placeShip(0, 1, 2, 0, 'h');
  gameController.placeShip(1, 2, 0, 0, 'h');
  gameController.placeShip(1, 1, 2, 0, 'h');
  gameController.startGame();
  expect(gameController.getWinner()).toBe(null);
  expect(await gameController.playRound(0, 0)).toBe(false);
  expect(gameController.getWinner()).toBe(null);
  expect(await gameController.playRound(1, 0)).toBe(false);
  expect(gameController.getWinner()).toBe(null);
  expect(await gameController.playRound(2, 0)).toBe(true);
  expect(gameController.getWinner()).toBe(gameController.getPlayers()[0]);
});

test('after winning the game, no more shots can be made', async () => {
  expect.assertions(1);
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
  gameController.createPlayers('Player 1', false, 'Player 2', false);
  gameController.placeShip(0, 2, 0, 0, 'h');
  gameController.placeShip(0, 1, 2, 0, 'h');
  gameController.placeShip(1, 2, 0, 0, 'h');
  gameController.placeShip(1, 1, 2, 0, 'h');
  gameController.startGame();
  await gameController.playRound(0, 0);
  await gameController.playRound(1, 0);
  await gameController.playRound(2, 0);
  try {
    await gameController.playRound(3, 0);
  } catch (error) {
    expect(error.message).toBe('Game not active');
  }
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

test.skip('placing random ships', () => {});

test.skip('placing random ships when not in ship placing state throws', () => {});
