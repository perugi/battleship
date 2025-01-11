import Gameboard from './Gameboard';

const Player = (name, isAi, dimension, shipLengths) => {
  const gameboard = new Gameboard(dimension, shipLengths);

  let opponent = null;

  const setOpponent = (newOpponent) => {
    opponent = newOpponent;
  };

  const shoot = (x, y) => {
    if (!opponent) throw new Error('No opponent set');

    return [opponent.receiveAttack(x, y), x, y];
  };

  const shootAuto = () => {
    if (!opponent) throw new Error('No opponent set');

    const emptySpaces = [];
    const opponentShotsReceived = opponent.getShotsReceived();
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (opponentShotsReceived[j][i] === false) {
          emptySpaces.push([i, j]);
        }
      }
    }

    if (emptySpaces.length > 0) {
      const randomEmptySpace =
        emptySpaces[Math.floor(Math.random() * emptySpaces.length)];

      return shoot(randomEmptySpace[0], randomEmptySpace[1]);
    }

    throw new Error('No empty spaces left');
  };

  const toString = () => {
    let string = `\n  Name: ${name}, isAi: ${isAi}\n\n`;
    string += `  Gameboard:\n`;

    string += gameboard.toString();

    return string;
  };

  return {
    getShotsReceived: () => gameboard.getShotsReceived(),
    clearShotsReceived: () => gameboard.clearShotsReceived(),
    getShips: () => gameboard.getShips(),
    getAdjacents: () => gameboard.getAdjacents(),
    placeShip: (...args) => gameboard.placeShip(...args),
    removeShip: (...args) => gameboard.removeShip(...args),
    placeRandomShips: (...args) => gameboard.placeRandomShips(...args),
    receiveAttack: (...args) => gameboard.receiveAttack(...args),
    allSunk: () => gameboard.allSunk(),
    getName: () => name,
    getIsAi: () => isAi,
    setOpponent,
    getOpponent: () => opponent,
    shoot,
    shootAuto,
    toString,
  };
};

export default Player;
