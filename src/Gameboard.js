import Ship from './Ship';

const Gameboard = (dimension) => {
  if (dimension < 1)
    throw new Error('Gameboard dimension must be greater than 0');
  const placedShips = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(null));
  const shotsReceived = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(false));
  const adjacents = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(new Set()));

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

  const placeShip = (shipLength, originX, originY, dir) => {
    if (shipLength < 1) throw new Error('Ship length must be greater than 0');
    if (dir !== 'v' && dir !== 'h')
      throw new Error('Direction must be either "v" or "h"');

    if (
      originX < 0 ||
      originY < 0 ||
      originX >= dimension ||
      originY >= dimension
    )
      throw new Error('Ship out of bounds');
    if (dir === 'h') {
      if (originX + shipLength > dimension)
        throw new Error('Ship out of bounds');
    } else if (originY + shipLength > dimension)
      throw new Error('Ship out of bounds');

    const newShipCoords = calculateShipCoordinates(
      shipLength,
      originX,
      originY,
      dir
    );
    newShipCoords.forEach(([x, y]) => {
      if (placedShips[y][x]) {
        throw new Error('Placed ship collides or adjacent to an existing ship');
      }
    });

    const ship = Ship(shipLength);
    newShipCoords.forEach(([x, y]) => {
      placedShips[y][x] = ship;

      // Fill in surrounding cells with adjacentTo objects. This is used to prevent
      // additional ships to be placed adjacent to this ship. The adjacentTo is a list
      // of ships that are adjacent to this ship, in order to show it on the GUI, once
      // a ship is sunk.
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            x + i >= 0 &&
            x + i < dimension &&
            y + j >= 0 &&
            y + j < dimension
          ) {
            if (placedShips[y + j][x + i] === null) {
              placedShips[y + j][x + i] = { adjacentTo: [ship] };
            } else if (placedShips[y + j][x + i].adjacentTo) {
              placedShips[y + j][x + i].adjacentTo.push(ship);
            }
          }
        }
      }
    });
  };

  const removeShip = (shipLength, originX, originY, dir) => {
    calculateShipCoordinates(shipLength, originX, originY, dir).forEach(
      ([x, y]) => {
        placedShips[y][x] = null;
      }

      // TODO remove the adjacentTo from the surrounding cells
    );
  };

  const clear = () => {
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        placedShips[y][x] = null;
        shotsReceived[y][x] = false;
      }
    }
  };

  const placeRandomShips = (shipLengths) => {
    clear();

    shipLengths.forEach((shipLength) => {
      if (shipLength > 0) {
        let placed = false;
        while (!placed) {
          const x = Math.floor(Math.random() * dimension);
          const y = Math.floor(Math.random() * dimension);
          const dir = Math.random() < 0.5 ? 'h' : 'v';
          try {
            placeShip(shipLength, x, y, dir);
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
      throw new Error('Coordinates out of bounds');
    if (shotsReceived[y][x]) throw new Error('Coordinates already hit');

    shotsReceived[y][x] = true;

    const ship = placedShips[y][x];
    if (ship && ship.hit) {
      ship.hit();
      return true;
    }

    return false;
  };

  const allSunk = () =>
    placedShips.every((row) =>
      row.every((el) => el === null || el.adjacentTo || el.isSunk() === true)
    );

  const toString = () => {
    let string = '';

    for (let i = 0; i < dimension; i++) {
      string += '  ';
      for (let j = 0; j < dimension; j++) {
        if (!shotsReceived[i][j]) {
          if (placedShips[i][j] && placedShips[i][j].hit) {
            string += ' O ';
          } else if (placedShips[i][j] && placedShips[i][j].adjacentTo) {
            string += ' . ';
          } else {
            string += '   ';
          }
        } else if (placedShips[i][j] && placedShips[i][j].hit) {
          string += ' X ';
        } else {
          string += ' - ';
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
    getShips: () => placedShips,
    getShotsReceived: () => shotsReceived,
    placeShip,
    removeShip,
    placeRandomShips,
    clear,
    receiveAttack,
    allSunk,
    toString,
  };
};

export default Gameboard;
