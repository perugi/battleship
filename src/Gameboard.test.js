import Gameboard from './Gameboard';
import { countShips, countShipCells } from './testHelpers';

describe('Gameboard tests', () => {
  it('creates an empty gameboard at insantiation', () => {
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

  it('throws when creating a gameboard with invalid dimension', () => {
    expect(() => {
      Gameboard('a');
    }).toThrow('Gameboard dimension must be an integer');

    expect(() => {
      Gameboard(1.2);
    }).toThrow('Gameboard dimension must be an integer');

    expect(() => {
      Gameboard(0);
    }).toThrow('Gameboard dimension must be greater than 0');

    expect(() => {
      Gameboard(-1);
    }).toThrow('Gameboard dimension must be greater than 0');
  });

  it('places a single ship', () => {
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

  it('places multiple ships', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    gameboard.placeShip(2, 2, 0, 'h');
    const ships = gameboard.getShips();
    expect(ships[0][0].getLength()).toBe(1);
    expect(ships[0][2].getLength()).toBe(2);
    expect(ships[0][3]).toBe(ships[0][2]);
  });

  it('throws when placing a ship out of bounds', () => {
    const gameboard = Gameboard(10);
    expect(() => {
      gameboard.placeShip(1, -1, 0, 'v');
    }).toThrow('Placed ship out of bounds');
    expect(() => {
      gameboard.placeShip(1, 0, -1, 'v');
    }).toThrow('Placed ship out of bounds');
    expect(() => {
      gameboard.placeShip(1, 10, 0, 'v');
    }).toThrow('Placed ship out of bounds');
    expect(() => {
      gameboard.placeShip(2, 9, 0, 'h');
    }).toThrow('Placed ship out of bounds');
  });

  it('throws when placing a ship on top of another ship', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 2, 0, 'v');
    expect(() => {
      gameboard.placeShip(1, 2, 0, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(3, 0, 0, 'h');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
  });

  it('throws when placing a ship directly adjacent to another ship', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 1, 1, 'v');
    expect(() => {
      gameboard.placeShip(1, 0, 0, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 0, 1, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 0, 2, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 1, 0, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 1, 2, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 2, 0, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 2, 1, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
    expect(() => {
      gameboard.placeShip(1, 2, 2, 'v');
    }).toThrow('Placed ship collides or adjacent to an existing ship');

    gameboard.placeShip(2, 5, 5, 'h');
    expect(() => {
      gameboard.placeShip(2, 3, 5, 'h');
    }).toThrow('Placed ship collides or adjacent to an existing ship');
  });

  it('throws when placing a ship with an invalid origin', () => {
    const gameboard = Gameboard(10);
    expect(() => {
      gameboard.placeShip(1, 'a', 0, 'v');
    }).toThrow('Ship origin X/Y must be an integer');
    expect(() => {
      gameboard.placeShip(1, 1.2, 0, 'v');
    }).toThrow('Ship origin X/Y must be an integer');
    expect(() => {
      gameboard.placeShip(1, 0, 'a', 'v');
    }).toThrow('Ship origin X/Y must be an integer');
  });

  it('throws when placing a ship with an invalid direction', () => {
    const gameboard = Gameboard(10);
    expect(() => {
      gameboard.placeShip(1, 0, 0, 'x');
    }).toThrow('Direction must be either "v" or "h"');
    expect(() => {
      gameboard.placeShip(1, 0, 0, 1);
    }).toThrow('Direction must be either "v" or "h"');
  });

  it('removes a ship', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    gameboard.placeShip(2, 2, 0, 'h');
    gameboard.removeShip(1, 0, 0, 'v');
    const ships = gameboard.getShips();
    expect(ships[0][0]).toBe(null);
    expect(ships[0][2].getLength()).toBe(2);
  });

  it('removes a large ship, and places another one in its previous spot', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    gameboard.placeShip(2, 2, 0, 'h');
    expect(gameboard.getShips()[0][2].getLength()).toBe(2);
    expect(gameboard.getShips()[0][3].getLength()).toBe(2);
    gameboard.removeShip(2, 2, 0, 'h');
    expect(gameboard.getShips()[0][2]).toBe(null);
    expect(gameboard.getShips()[0][3]).toBe(null);
    gameboard.placeShip(2, 2, 0, 'h');
    expect(gameboard.getShips()[0][2].getLength()).toBe(2);
  });

  it('receives an attack, hitting and sinking a small ship', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
    expect(gameboard.getShotsReceived()[0][0]).toBe(false);
    expect(gameboard.receiveAttack(0, 0)).toBe(true);
    expect(gameboard.getShips()[0][0].isSunk()).toBe(true);
    expect(gameboard.getShotsReceived()[0][0]).toBe(true);
  });

  it('receives multiple attacks, hitting and sinking a large ship', () => {
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

  it('receives an attack, missing any ships', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
    expect(gameboard.getShotsReceived()[0][1]).toBe(false);
    expect(gameboard.receiveAttack(1, 0)).toBe(false);
    expect(gameboard.getShips()[0][0].isSunk()).toBe(false);
    expect(gameboard.getShotsReceived()[0][1]).toBe(true);
  });

  it('throws when attacking the same coordinates twice', () => {
    const gameboard = Gameboard(10);
    gameboard.receiveAttack(0, 0);
    expect(() => {
      gameboard.receiveAttack(0, 0);
    }).toThrow('Attack coordinates already hit');
  });

  it('throws when an attack is out of bounds', () => {
    const gameboard = Gameboard(10);
    expect(() => {
      gameboard.receiveAttack(10, 0);
    }).toThrow('Attack coordinates out of bounds');
    expect(() => {
      gameboard.receiveAttack(0, 10);
    }).toThrow('Attack coordinates out of bounds');
    expect(() => {
      gameboard.receiveAttack(-1, 0);
    }).toThrow('Attack coordinates out of bounds');
    expect(() => {
      gameboard.receiveAttack(0, -1);
    }).toThrow('Attack coordinates out of bounds');
  });

  it('returns allSunk as true when all ships are sunk', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    gameboard.placeShip(2, 2, 0, 'h');
    expect(gameboard.allSunk()).toBe(false);
    gameboard.receiveAttack(0, 0);
    expect(gameboard.allSunk()).toBe(false);
    gameboard.receiveAttack(2, 0);
    expect(gameboard.allSunk()).toBe(false);
    gameboard.receiveAttack(3, 0);
    expect(gameboard.allSunk()).toBe(true);
  });

  it('places ships randomly', () => {
    const gameboard = Gameboard(10);
    gameboard.placeRandomShips([1, 2, 3, 4, 5]);
    expect(countShips(gameboard)).toBe(5);
    expect(countShipCells(gameboard)).toBe(1 + 2 + 3 + 4 + 5);
  });

  it('does not place any ships when randomly placing a ship list of length 0', () => {
    const gameboard = Gameboard(10);
    gameboard.placeRandomShips([0]);
    expect(countShips(gameboard)).toBe(0);
  });

  it.skip('clears the board', () => {
    const gameboard = Gameboard(10);
    gameboard.placeShip(1, 0, 0, 'v');
    gameboard.placeShip(2, 2, 0, 'h');
    expect(countShips(gameboard)).toBe(2);
    gameboard.clearBoard();
    expect(countShips(gameboard)).toBe(0);
    gameboard.clearBoard();
    expect(countShips(gameboard)).toBe(0);
  });

  it('clears shots received', () => {
    const gameboard = Gameboard(10);
    gameboard.receiveAttack(0, 0);
    expect(gameboard.getShotsReceived()[0][0]).toBe(true);
    gameboard.receiveAttack(0, 1);
    expect(gameboard.getShotsReceived()[1][0]).toBe(true);
    gameboard.clearShotsReceived();
    expect(gameboard.getShotsReceived()[0][0]).toBe(false);
  });
});
