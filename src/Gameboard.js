/* eslint-disable no-param-reassign */
import Ship from './Ship';

const Gameboard = (dimension = 10, shipLengths = [2, 2, 3, 4, 5]) => {
  if (!Number.isInteger(dimension)) {
    throw new Error('Gameboard dimension must be an integer');
  }
  if (dimension < 1)
    throw new Error('Gameboard dimension must be greater than 0');

  if (!Array.isArray(shipLengths)) {
    throw new Error('shipLengths must be an array');
  }
  if (shipLengths.length === 0) {
    throw new Error('shipLengths must not be empty');
  }
  if (
    shipLengths.some(
      (length) => !Number.isInteger(length) || length < 1 || length > dimension
    )
  ) {
    throw new Error(
      'shipLengths must be an array of integers between 1 and dimension'
    );
  }

  const placingStatus = shipLengths
    .toSorted((a, b) => a - b)
    .map((length) => ({
      length,
      placed: false,
      origin: { x: null, y: null },
      dir: null,
    }));

  const placedShips = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(null));

  const shotsReceived = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(false));

  const adjacents = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(false).map(() => new Set()));

  const calculateShipCoordinates = (shipLength, x, y, dir) => {
    const shipCoordinates = [];
    for (let i = 0; i < shipLength; i++) {
      if (dir === 'v') {
        shipCoordinates.push([x, y + i]);
      } else {
        shipCoordinates.push([x + i, y]);
      }
    }
    return shipCoordinates;
  };

  const modifyAdjacents = (x, y, ship, operation) => {
    for (
      let row = Math.max(0, y - 1);
      row <= Math.min(y + 1, dimension - 1);
      row++
    ) {
      for (
        let col = Math.max(0, x - 1);
        col <= Math.min(x + 1, dimension - 1);
        col++
      ) {
        if (operation === 'add') {
          adjacents[row][col].add(ship);
        } else if (operation === 'remove') {
          adjacents[row][col].delete(ship);
        }
      }
    }
  };

  const placeShip = (shipIndex, originX, originY, dir) => {
    if (!Number.isInteger(shipIndex)) {
      throw new Error('Ship index must be an integer');
    }

    if (shipIndex < 0 || shipIndex >= placingStatus.length) {
      throw new Error(
        `There are no ships of index ${shipIndex} available for placement`
      );
    }

    const shipToBePlaced = placingStatus[shipIndex];

    if (shipToBePlaced.placed) {
      throw new Error(`Ship of index ${shipIndex} has already been placed`);
    }

    if (!Number.isInteger(originX) || !Number.isInteger(originY))
      throw new Error('Ship origin X/Y must be an integer');

    if (dir !== 'v' && dir !== 'h')
      throw new Error('Direction must be either "v" or "h"');

    if (
      originX < 0 ||
      originY < 0 ||
      originX >= dimension ||
      originY >= dimension
    )
      throw new Error('Placed ship out of bounds');
    if (dir === 'h') {
      if (originX + shipToBePlaced.length > dimension)
        throw new Error('Placed ship out of bounds');
    } else if (originY + shipToBePlaced.length > dimension)
      throw new Error('Placed ship out of bounds');

    const newShipCoords = calculateShipCoordinates(
      shipToBePlaced.length,
      originX,
      originY,
      dir
    );
    newShipCoords.forEach(([x, y]) => {
      if (adjacents[y][x].size > 0) {
        throw new Error('Placed ship collides or adjacent to an existing ship');
      }
    });

    const ship = Ship(shipToBePlaced.length);
    newShipCoords.forEach(([x, y]) => {
      placedShips[y][x] = ship;
      modifyAdjacents(x, y, ship, 'add');
    });

    shipToBePlaced.placed = true;
    shipToBePlaced.origin.x = originX;
    shipToBePlaced.origin.y = originY;
    shipToBePlaced.dir = dir;
  };

  const removeShip = (shipIndex) => {
    if (!Number.isInteger(shipIndex)) {
      throw new Error('Ship index must be an integer');
    }

    if (shipIndex < 0 || shipIndex >= placingStatus.length) {
      throw new Error(`There are no ships of index ${shipIndex} to remove`);
    }
    const shipToBeRemoved = placingStatus[shipIndex];

    if (!shipToBeRemoved.placed) {
      throw new Error(
        `Ship at index ${shipIndex} is not placed, cannot remove`
      );
    }

    calculateShipCoordinates(
      shipToBeRemoved.length,
      shipToBeRemoved.origin.x,
      shipToBeRemoved.origin.y,
      shipToBeRemoved.dir
    ).forEach(([x, y]) => {
      const ship = placedShips[y][x];
      placedShips[y][x] = null;
      modifyAdjacents(x, y, ship, 'remove');
    });

    shipToBeRemoved.placed = false;
    shipToBeRemoved.origin.x = null;
    shipToBeRemoved.origin.y = null;
    shipToBeRemoved.dir = null;
  };

  const clearShotsReceived = () => {
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        shotsReceived[y][x] = false;
      }
    }
  };

  const clearShips = () => {
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        placedShips[y][x] = null;
        shotsReceived[y][x] = false;
        adjacents[y][x].clear();
      }
    }

    placingStatus.forEach((status) => {
      status.placed = false;
      status.origin.x = null;
      status.origin.y = null;
      status.dir = null;
    });
  };

  const placeRandomShips = () => {
    clearShips();

    placingStatus.forEach((ship, index) => {
      if (ship.length > 0) {
        let placed = false;
        while (!placed) {
          const x = Math.floor(Math.random() * dimension);
          const y = Math.floor(Math.random() * dimension);
          const dir = Math.random() < 0.5 ? 'h' : 'v';
          try {
            placeShip(index, x, y, dir);
            ship.placed = true;
            placed = true;
          } catch (e) {
            // If a collision or out of bounds occurs, do nothing and try to place
            // the ship again in the next iteration of the loop.
          }
        }
      }
    });
  };

  const receiveAttack = (x, y) => {
    if (x < 0 || x >= dimension || y < 0 || y >= dimension)
      throw new Error('Attack coordinates out of bounds');
    if (shotsReceived[y][x]) throw new Error('Attack coordinates already hit');

    shotsReceived[y][x] = true;

    const ship = placedShips[y][x];
    if (ship) {
      ship.hit();
      return true;
    }

    return false;
  };

  const allSunk = () =>
    placedShips.every((row) =>
      row.every((el) => el === null || el.isSunk() === true)
    );

  const toString = () => {
    let string = '';

    for (let i = 0; i < dimension; i++) {
      string += '  ';
      for (let j = 0; j < dimension; j++) {
        if (shotsReceived[i][j]) {
          if (placedShips[i][j]) {
            string += ' X ';
          } else {
            string += ' - ';
          }
        } else if (placedShips[i][j]) {
          string += ' O ';
        } else if (adjacents[i][j].size > 0) {
          string += ' . ';
        } else {
          string += '   ';
        }
        string += '|';
      }
      string += '\n';
      string += '  ----------------------------------------\n';
    }

    return string;
  };

  return {
    getDimension: () => dimension,
    getPlacingStatus: () => placingStatus,
    getAllShipsPlaced: () => placingStatus.every((status) => status.placed),
    getShips: () => placedShips,
    getShotsReceived: () => shotsReceived,
    getAdjacents: () => adjacents,
    clearShotsReceived,
    clearShips,
    placeShip,
    removeShip,
    placeRandomShips,
    receiveAttack,
    allSunk,
    toString,
  };
};

export default Gameboard;
