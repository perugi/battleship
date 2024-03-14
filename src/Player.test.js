import Player from './Player';

test('Instantiate human player with name', () => {
  const player = Player('Player', false);
  expect(player.getName()).toBe('Player');
  expect(player.getIsAi()).toBe(false);
});

test('Instantiate AI player with name', () => {
  const player = Player('Computer', true);
  expect(player.getName()).toBe('Computer');
  expect(player.getIsAi()).toBe(true);
});

test('Default gameboard is 10x10 and empty', () => {
  const player = Player('Player', false);
  expect(player.getShips().length).toBe(10);
  expect(player.getShips().every((col) => col.every((el) => el === null))).toBe(
    true
  );
  expect(
    player.getShotsReceived().every((col) => col.every((el) => el === false))
  ).toBe(true);
});

test('Set players opponent', () => {
  const player = Player('Player', false);
  const opponent = Player('Computer', true);
  player.setOpponent(opponent);
  expect(player.getOpponent()).toBe(opponent);
});

test('Print player data', () => {
  const player = Player('Player', false);
  expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
  player.placeShip(1, 0, 0, 'v');
  expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   O |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
  player.receiveAttack(0, 0);
  expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   X |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
  player.receiveAttack(1, 0);
  expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   X | - |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
});

function countHitsOnBoard(board) {
  return board.reduce(
    (totalHitsOnBoard, row) =>
      totalHitsOnBoard +
      row.reduce((totalHitsInRow, el) => totalHitsInRow + (el === true), 0),
    0
  );
}

test('human player can manually attack', () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  player.setOpponent(computer);
  expect(countHitsOnBoard(computer.getShotsReceived())).toBe(0);
  player.shoot(0, 0);
  expect(countHitsOnBoard(computer.getShotsReceived())).toBe(1);
  expect(computer.getShotsReceived()[0][0]).toBe(true);
});

test('AI player can automatically attack', async () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  computer.setOpponent(player);
  expect(countHitsOnBoard(player.getShotsReceived())).toBe(0);
  await computer.shootAuto(0);
  expect(countHitsOnBoard(player.getShotsReceived())).toBe(1);
});

test('hitting an opponent ship returns true and shot coords, missing returns false and shot coords', () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  player.setOpponent(computer);
  computer.placeShip(1, 0, 0, 'h');
  expect(player.shoot(0, 0)).toEqual([true, 0, 0]);
  expect(player.shoot(1, 0)).toEqual([false, 1, 0]);
});

test('when human shoots, if no opponents is set, exception is thrown', () => {
  const player = Player('Player', false);
  expect(() => {
    player.shoot(0, 0);
  }).toThrow('No opponent set');
});

test('when AI shoots, if no opponents is set, exception is thrown', async () => {
  expect.assertions(1);
  const player = Player('Player', true);
  try {
    await player.shootAuto(0);
  } catch (error) {
    expect(error.message).toBe('No opponent set');
  }
});

test('When AI cannot find an empty space to shoot, exception is thrown', async () => {
  //   expect.assertions(2);
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  computer.setOpponent(player);
  for (let i = 0; i < 100; i++) {
    await computer.shootAuto(0);
  }
  expect(countHitsOnBoard(player.getShotsReceived())).toBe(100);
  try {
    await computer.shootAuto(0);
  } catch (error) {
    expect(error.message).toBe('No empty spaces left');
  }
});
