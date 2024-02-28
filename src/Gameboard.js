import Ship from './Ship';

const Gameboard = (dimension) => {
  if (dimension < 1)
    throw new Error('Gameboard dimension must be greater than 0');
  const placedShips = {};
  const placedShipsCoords = [];

  const getDimension = () => dimension;

  const getShipCoordinates = () => placedShipsCoords;

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

    if (x < 0 || y < 0 || x >= dimension || y >= dimension)
      throw new Error('Ship out of bounds');
    if (dir === 'h') {
      if (x + shipLength > dimension) throw new Error('Ship out of bounds');
    } else if (y + shipLength > dimension)
      throw new Error('Ship out of bounds');

    const newShipCoords = calculateShipCoordinates(shipLength, x, y, dir);
    if (
      // To compare the coordinates, which are arrays, have to convert both to strings.
      newShipCoords.some((newCoords) =>
        placedShipsCoords
          .map((placedCoords) => placedCoords.toString())
          .includes(newCoords.toString())
      )
    )
      throw new Error('Placed ship collides with an existing ship');

    const ship = Ship(shipLength);
    placedShips[`${x} ${y} ${dir}`] = ship;
    placedShipsCoords.push(...newShipCoords);
  };

  const removeShip = (shipLength, x, y, dir) => {
    const ship = placedShips[`${x} ${y} ${dir}`];
    if (!ship) throw new Error('Ship not found');

    calculateShipCoordinates(shipLength, x, y, dir).forEach((deleteCoords) => {
      placedShipsCoords.splice(
        placedShipsCoords
          .map((placedCoords) => placedCoords.toString())
          .indexOf(deleteCoords.toString()),
        1
      );
    });
    delete placedShips[`${x} ${y} ${dir}`];
  };

  return {
    getDimension,
    getShipCoordinates,
    placeShip,
    removeShip,
  };
};

export default Gameboard;
