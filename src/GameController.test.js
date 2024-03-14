import GameController from './GameController';

test('start a new game, creating the players and assigning the active player', () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Computer', true);
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
});

test('make a shot and hit the opponents ship', async () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
  expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(false);

  await gameController.playRound(0, 0);
  expect(gameController.getPlayers()[0].getShotsReceived()[0][0]).toBe(false);
  expect(gameController.getPlayers()[1].getShotsReceived()[0][0]).toBe(true);

  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[0]);
});

test('make a shot and miss the opponents ship', async () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
  await gameController.playRound(9, 9);
  expect(gameController.getActivePlayer()).toBe(gameController.getPlayers()[1]);
});

test('make a shot with no active player set', async () => {
  expect.assertions(1);
  const gameController = GameController();
  try {
    await gameController.playRound(0, 0);
  } catch (error) {
    expect(error.message).toBe('Game not active');
  }
});

test('sinking all the ships wins the game', async () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
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
  await gameController.playRound(0, 0);
  await gameController.playRound(1, 0);
  await gameController.playRound(2, 0);
  try {
    await gameController.playRound(3, 0);
  } catch (error) {
    expect(error.message).toBe('Game not active');
  }
});

test('starting a new game clears the board', () => {
  const gameController = GameController();
  gameController.newGame('Player 1', false, 'Player 2', false);
  gameController.newGame('Player 1', false, 'Player 2', false);
});
