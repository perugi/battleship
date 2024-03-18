import Gameboard from './Gameboard';
import { countShips, countShipCells } from './testHelpers';

test('create an empty board', () => {
  const gameboard = Gameboard(10);
  const ships = gameboard.getShips();
  const shotsReceived = gameboard.getShotsReceived();
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      expect(ships[i][j]).toBe(null);
      expect(shotsReceived[i][j]).toBe(false);
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
  const ships = gameboard.getShips();
  expect(ships[0][0].getLength()).toBe(1);
  for (let i = 1; i < 5; i++) {
    expect(ships[0][i]).toBe(null);
  }
  for (let i = 0; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      expect(ships[i][j]).toBe(null);
    }
  }
});

test('create a board with multiple ships', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  const ships = gameboard.getShips();
  expect(ships[0][0].getLength()).toBe(1);
  expect(ships[0][1].getLength()).toBe(2);
  expect(ships[0][1]).toBe(ships[0][2]);
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
  const ships = gameboard.getShips();
  expect(ships[0][0]).toBe(null);
  expect(ships[0][1].getLength()).toBe(2);
});

test('remove a large ship, place another one in its previous spot', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[0][1].getLength()).toBe(2);
  expect(gameboard.getShips()[0][2].getLength()).toBe(2);
  gameboard.removeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[0][1]).toBe(null);
  expect(gameboard.getShips()[0][2]).toBe(null);
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.getShips()[0][1].getLength()).toBe(2);
});

test('make an attack and hit a ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  expect(gameboard.getShotsReceived()[0][0]).toBe(false);
  expect(gameboard.receiveAttack(0, 0)).toBe(true);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(true);
  expect(gameboard.getShotsReceived()[0][0]).toBe(true);
});

test('sink a large ship', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(2, 0, 0, 'h');
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  expect(gameboard.getShotsReceived()[0][0]).toBe(false);
  expect(gameboard.getShotsReceived()[0][1]).toBe(false);
  expect(gameboard.receiveAttack(0, 0)).toBe(true);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  expect(gameboard.getShotsReceived()[0][0]).toBe(true);
  expect(gameboard.getShotsReceived()[0][1]).toBe(false);
  expect(gameboard.receiveAttack(1, 0)).toBe(true);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(true);
  expect(gameboard.getShotsReceived()[0][0]).toBe(true);
  expect(gameboard.getShotsReceived()[0][1]).toBe(true);
});

test('make an attack and miss', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  expect(gameboard.getShotsReceived()[0][1]).toBe(false);
  expect(gameboard.receiveAttack(1, 0)).toBe(false);
  expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
  expect(gameboard.getShotsReceived()[0][1]).toBe(true);
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

test('return allSunk as true when all ships are sunk', () => {
  const gameboard = Gameboard(10);
  gameboard.placeShip(1, 0, 0, 'v');
  gameboard.placeShip(2, 1, 0, 'h');
  expect(gameboard.allSunk()).toBe(false);
  gameboard.receiveAttack(0, 0);
  expect(gameboard.allSunk()).toBe(false);
  gameboard.receiveAttack(1, 0);
  expect(gameboard.allSunk()).toBe(false);
  gameboard.receiveAttack(2, 0);
  expect(gameboard.allSunk()).toBe(true);
});

test.skip('it is possible to randomly place ships', () => {
  const gameboard = Gameboard(10);
  gameboard.placeRandomShips([1, 2, 3, 4, 5]);
  // console.log(gameboard.getShips());
  expect(countShips(gameboard)).toBe(5);
  expect(countShipCells(gameboard)).toBe(1 + 2 + 3 + 4 + 5);
});

test.skip('randomly placing a ship of length 0 does not place anything', () => {});
