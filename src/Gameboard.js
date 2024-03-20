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
      if (adjacents[y][x].size > 0) {
        throw new Error('Placed ship collides or adjacent to an existing ship');
      }
    });

    const ship = Ship(shipLength);
    newShipCoords.forEach(([x, y]) => {
      placedShips[y][x] = ship;
      modifyAdjacents(x, y, ship, 'add');
    });
  };

  const removeShip = (shipLength, originX, originY, dir) => {
    calculateShipCoordinates(shipLength, originX, originY, dir).forEach(
      ([x, y]) => {
        const ship = placedShips[y][x];
        placedShips[y][x] = null;
        modifyAdjacents(x, y, ship, 'remove');
      }
    );
  };

  const clear = () => {
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        placedShips[y][x] = null;
        shotsReceived[y][x] = false;
        adjacents[y][x].clear();
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
    getShips: () => placedShips,
    getShotsReceived: () => shotsReceived,
    getAdjacents: () => adjacents,
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
