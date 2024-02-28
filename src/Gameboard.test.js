import Gameboard from './Gameboard';
import Ship from './Ship';

test('create an empty board', () => {
  const gameboard = Gameboard(10);
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      expect(gameboard.getShips()[i][j]).toBe(null);
    }
  }
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
  // In this test, we also test that all the other coordinates stay null.
  // This is not re-tested in the following tests.
  expect(gameboard.getShips()[0][0].getLength()).toBe(1);
  for (let i = 1; i < 5; i++) {
    expect(gameboard.getShips()[0][i]).toBe(null);
  }
  for (let i = 0; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      expect(gameboard.getShips()[i][j]).toBe(null);
    }
  }
});

test('create a board with multiple ships', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[0][0].getLength()).toBe(1);
  expect(gameboard.getShips()[1][0].getLength()).toBe(2);
  expect(gameboard.getShips()[1][0]).toBe(gameboard.getShips()[2][0]);
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
  expect(gameboard.getShips()[0][0]).toBe(null);
  expect(gameboard.getShips()[1][0].getLength()).toBe(2);
});

test('remove a large ship, place another one in its previous spot', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[1][0].getLength()).toBe(2);
  expect(gameboard.getShips()[2][0].getLength()).toBe(2);
  gameboard.removeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[1][0]).toBe(null);
  expect(gameboard.getShips()[2][0]).toBe(null);
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[1][0].getLength()).toBe(2);
});

test('make an attack and hit a ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  gameboard.receiveAttack(0, 0);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(true);
});

test('make an attack and miss', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  gameboard.receiveAttack(1, 0);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
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

test.skip('return allSunk as true when all ships are sunk', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(1, 1, 0, 'h');
  expect(gameboard.allSunk()).toBe(false);
  gameboard.receiveAttack(0, 0);
  expect(gameboard.allSunk()).toBe(false);
  gameboard.receiveAttack(1, 0);
  expect(gameboard.allSunk()).toBe(true);
});
