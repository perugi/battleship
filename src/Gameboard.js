import Ship from './Ship';

const Gameboard = (dimension) => {
  if (dimension < 1)
    throw new Error('Gameboard dimension must be greater than 0');
  const placedShips = {};
  const placedShipsCoords = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(false));
  const shotsReceived = new Array(dimension)
    .fill(false)
    .map(() => new Array(dimension).fill(false));

  const getDimension = () => dimension;

  const getShips = () => placedShips;

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
    if (!Number.isInteger(shipLength))
      throw new Error('Ship length must be an integer');
    if (shipLength < 1) throw new Error('Ship length must be greater than 0');
    if (!Number.isInteger(originX))
      throw new Error('X coordinate must be an integer');
    if (!Number.isInteger(originY))
      throw new Error('Y coordinate must be an integer');
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
      if (placedShipsCoords[y][x])
        throw new Error('Placed ship collides with an existing ship');
    });

    const ship = Ship(shipLength);
    placedShips[`${originX} ${originY} ${dir}`] = ship;
    newShipCoords.forEach(([x, y]) => {
      placedShipsCoords[y][x] = true;
    });
  };

  const removeShip = (shipLength, originX, originY, dir) => {
    const ship = placedShips[`${originX} ${originY} ${dir}`];
    if (!ship) throw new Error('Ship not found');

    calculateShipCoordinates(shipLength, originX, originY, dir).forEach(
      ([x, y]) => {
        placedShipsCoords[y][x] = false;
      }
    );
    delete placedShips[`${originX} ${originY} ${dir}`];
  };

  const receiveAttack = (x, y) => {
    // TODO Check if the coordinates are valid (out of bounds or already hit)

    const ship = placedShips[`${x} ${y} v`];
    if (ship) ship.hit();
  };

  return {
    getDimension,
    getShips,
    placeShip,
    removeShip,
    receiveAttack,
  };
};

export default Gameboard;
