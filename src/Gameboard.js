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
      if (placedShips[x][y])
        throw new Error('Placed ship collides with an existing ship');
    });

    const ship = Ship(shipLength);
    newShipCoords.forEach(([x, y]) => {
      placedShips[y][x] = ship;
    });
  };

  const removeShip = (shipLength, originX, originY, dir) => {
    calculateShipCoordinates(shipLength, originX, originY, dir).forEach(
      ([x, y]) => {
        placedShips[y][x] = null;
      }
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
  };
};

export default Gameboard;
