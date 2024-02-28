import Gameboard from './Gameboard';

test('create an empty board', () => {
  const gameboard = Gameboard(10);
  expect(gameboard.getShipCoordinates().length).toBe(0);
  expect(gameboard.getDimension()).toBe(10);
});

test('creating a board with dimension less than 1 throws an error', () => {
  expect(() => {
    Gameboard(0);
  }).toThrow('Gameboard dimension must be greater than 0');

  expect(() => {
    Gameboard(-1);
  }).toThrow('Gameboard dimension must be greater than 0');
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
    [2, 0],
  ]);
});

test('placing a ship out of bounds throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, -1, 0, 'v');
  }).toThrow('Ship out of bounds');
  expect(() => {
    gameboard.placeShip(1, 0, -1, 'v');
  }).toThrow('Ship out of bounds');
  expect(() => {
    gameboard.placeShip(1, 10, 0, 'v');
  }).toThrow('Ship out of bounds');
  expect(() => {
    gameboard.placeShip(2, 9, 0, 'h');
  }).toThrow('Ship out of bounds');
});

test('placing a ship on top of another ship throws an error', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(() => {
    gameboard.placeShip(2, 0, 0, 'v');
  }).toThrow('Placed ship collides with an existing ship');
});

test('placing a ship with an invalid length throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(0, 0, 0, 'v');
  }).toThrow('Ship length must be greater than 0');
  expect(() => {
    gameboard.placeShip(-1, 0, 0, 'v');
  }).toThrow('Ship length must be greater than 0');
  expect(() => {
    gameboard.placeShip('a', 0, 0, 'v');
  }).toThrow('Ship length must be an integer');
});

test('placing a ship with an invalid coordinate throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, '0', 0, 'v');
  }).toThrow('X coordinate must be an integer');
  expect(() => {
    gameboard.placeShip(1, 0, '0', 'v');
  }).toThrow('Y coordinate must be an integer');
});

test('placing a ship with an invalid direction throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.placeShip(1, 0, 0, 'x');
  }).toThrow('Direction must be either "v" or "h"');
  expect(() => {
    gameboard.placeShip(1, 0, 0, 1);
  }).toThrow('Direction must be either "v" or "h"');
});

test('remove a ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  gameboard.removeShip(1, 0, 0, 'v');
  expect(gameboard.getShipCoordinates()).toEqual([
    [1, 0],
    [2, 0],
  ]);
});

test('remove a large ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  gameboard.removeShip(2, 1, 0, 'h');
  expect(gameboard.getShipCoordinates()).toEqual([[0, 0]]);
});

test('removing an unexistent ship throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.removeShip(1, 0, 0, 'v');
  }).toThrow('Ship not found');
});

// test('hit a ship with an attack', () => {
//   const gameboard = Gameboard(10);
//   gameboard.placeShip(1, 0, 0, 'v');
//   gameboard.hit(1, 0, 0, 'v');
//   expect(gameboard.getShip(1, 0, 0, 'v').isSunk()).toBe(true);
// })
