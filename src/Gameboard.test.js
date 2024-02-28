import Gameboard from './Gameboard';

test('create an empty board', () => {
  const gameboard = Gameboard(10);
  expect(gameboard.getShipCoordinates().length).toBe(0);
  expect(gameboard.getDimension()).toBe(10);
});

test('creating a board with dimension less than 1 throws an error', () => {
  expect(() => {
    Gameboard(0);
  }).toThrow();

  expect(() => {
    Gameboard(-1);
  }).toThrow();
});

test('create a board with a single ship', () => {
  const gameboard = Gameboard(5);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShipCoordinates()).toEqual([[0, 0]]);
});

test('create a board with multiple ships', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShipCoordinates()).toEqual([
    [0, 0],
    [1, 0],
    [1, 0],
  ]);
});

test('placing a ship out of bounds throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, 10, 0, 'v');
  }).toThrow();
  expect(() => {
    gameboard.placeShip(2, 9, 0, 'h');
  }).toThrow();
});

test('placing a ship on top of another ship throws an error', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(() => {
    gameboard.placeShip(2, 0, 0, 'v');
  }).toThrow();
});

test('placing a ship with an invalid length throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(0, 0, 0, 'v');
  }).toThrow();
  expect(() => {
    gameboard.placeShip(-1, 0, 0, 'v');
  }).toThrow();
  expect(() => {
    gameboard.placeShip('a', 0, 0, 'v');
  });
});

test('placing a ship with an invalid coordinate throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, '0', 0, 'v');
  }).toThrow();
  expect(() => {
    gameboard.placeShip(1, 0, '0', 'v');
  }).toThrow();
});

test('placing a ship with an invalid direction throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, 0, 0, 'x');
  }).toThrow();
  expect(() => {
    gameboard.placeShip(1, 0, 0, 1);
  }).toThrow();
});

test('remove a ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.removeShip(1, 0, 0, 'v');
  expect(gameboard.getShips().length).toBe(0);
});

test('removing an unexistent ship throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.removeShip(1, 0, 0, 'v');
  }).toThrow();
});

// test('hit a ship with an attack', () => {
//   const gameboard = Gameboard(10);
//   gameboard.placeShip(1, 0, 0, 'v');
//   gameboard.hit(1, 0, 0, 'v');
//   expect(gameboard.getShip(1, 0, 0, 'v').isSunk()).toBe(true);
// })
