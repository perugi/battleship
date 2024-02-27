import Ship from './Ship';

const Gameboard = (dimension) => {
  if (dimension < 1)
    throw new Error('Gameboard dimension must be greater than 0');
  const placedShips = {};

  const getDimension = () => dimension;

  const getShipCoordinates = () => {
    const shipCoordinates = [];
    Object.entries(placedShips).forEach((coords, ship) => {
      const [x, y, dir] = coords.split(' ');
      for (let i = 0; i < ship.getLength(); i++) {
        if (dir === 'v') {
          shipCoordinates.push([x, y + i]);
        } else {
          shipCoordinates.push([x + i, y]);
        }
      }
    });

    return shipCoordinates;
  };

  const placeShip = (shipLength, x, y, dir) => {
    if (!Number.isInteger(shipLength))
      throw new Error('Ship length must be an integer');
    if (shipLength < 1) throw new Error('Ship length must be greater than 0');
    if (!Number.isInteger(x))
      throw new Error('X coordinate must be an integer');
    if (!Number.isInteger(y))
      throw new Error('Y coordinate must be an integer');
    if (dir !== 'v' && dir !== 'h')
      throw new Error('Direction must be either "v" or "h"');

    const ship = Ship(shipLength);
    placedShips[`${x} ${y} ${dir}`] = ship;
  };

  return {
    getDimension,
    getShipCoordinates,
    placeShip,
  };
};

export default Gameboard;
