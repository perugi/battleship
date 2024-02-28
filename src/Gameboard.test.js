import Gameboard from './Gameboard';

test('create an empty board', () => {
  const gameboard = Gameboard(10);
  expect(Object.keys(gameboard.getShips()).length).toBe(0);
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
  expect(Object.keys(gameboard.getShips())).toEqual(['0 0 v']);
  expect(
    Object.values(gameboard.getShips()).map((ship) => ship.getLength())
  ).toEqual([1]);
});

test('create a board with multiple ships', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(Object.keys(gameboard.getShips())).toEqual(['0 0 v', '1 0 h']);
  expect(
    Object.values(gameboard.getShips()).map((ship) => ship.getLength())
  ).toEqual([1, 2]);
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
  expect(Object.keys(gameboard.getShips())).toEqual(['1 0 h']);
});

test('remove a large ship, place another one in its previous spot', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  gameboard.removeShip(2, 1, 0, 'h');
  expect(Object.keys(gameboard.getShips())).toEqual(['0 0 v']);
  gameboard.placeShip(2, 1, 0, 'h');
  expect(Object.keys(gameboard.getShips())).toEqual(['0 0 v', '1 0 h']);
});

test('removing an unexistent ship throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.removeShip(1, 0, 0, 'v');
  }).toThrow('Ship not found');
});

test('make an attack and hit a ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()['0 0 v'].isSunk()).toBe(false);
  gameboard.receiveAttack(0, 0);
  expect(gameboard.getShips()['0 0 v'].isSunk()).toBe(true);
});

test('make an attack and miss', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()['0 0 v'].isSunk()).toBe(false);
  gameboard.receiveAttack(1, 0);
  expect(gameboard.getShips()['0 0 v'].isSunk()).toBe(false);
});

test('attacking the same coordinate twice throws an error', () => {
  const gameboard = Gameboard(10);
  gameboard.receiveAttack(0, 0);
  expect(() => {
    gameboard.receiveAttack(0, 0);
  }).toThrow('Coordinates already hit');
});

test('attack is out of bounds throws an error', () => {
  const gameboard = Gameboard(10);
  expect(() => {
    gameboard.receiveAttack(10, 0);
  }).toThrow('Coordinates out of bounds');
  expect(() => {
    gameboard.receiveAttack(0, 10);
  }).toThrow('Coordinates out of bounds');
  expect(() => {
    gameboard.receiveAttack(-1, 0);
  }).toThrow('Coordinates out of bounds');
  expect(() => {
    gameboard.receiveAttack(0, -1);
  }).toThrow('Coordinates out of bounds');
});