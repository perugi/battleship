import Gameboard from './Gameboard';

const DIMENSION = 10;

const Player = (name, isAi) => {
  const gameboard = new Gameboard(DIMENSION);

  let opponent = null;

  const delay = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const setOpponent = (newOpponent) => {
    opponent = newOpponent;
  };

  const shoot = (x, y) => {
    if (!opponent) throw new Error('No opponent set');

    return [opponent.receiveAttack(x, y), x, y];
  };

  const shootAuto = async (delayTime = 1000) => {
    if (!opponent) throw new Error('No opponent set');

    const emptySpaces = [];
    const opponentShotsReceived = opponent.getShotsReceived();
    for (let i = 0; i < DIMENSION; i++) {
      for (let j = 0; j < DIMENSION; j++) {
        if (opponentShotsReceived[j][i] === false) {
          emptySpaces.push([i, j]);
        }
      }
    }

    if (emptySpaces.length > 0) {
      const randomEmptySpace =
        emptySpaces[Math.floor(Math.random() * emptySpaces.length)];

      await delay(delayTime);

      return shoot(randomEmptySpace[0], randomEmptySpace[1]);
    }

    throw new Error('No empty spaces left');
  };

  const toString = () => {
    let string = `\n  Name: ${name}, isAi: ${isAi}\n\n`;

    string += `  Gameboard:\n`;

    const shotsReceived = gameboard.getShotsReceived();
    const ships = gameboard.getShips();

    for (let i = 0; i < DIMENSION; i++) {
      string += '  ';
      for (let j = 0; j < DIMENSION; j++) {
        if (!shotsReceived[i][j]) {
          if (ships[i][j] && ships[i][j].hit) {
            string += ' O ';
          } else if (ships[i][j] && ships[i][j].adjacentTo) {
            string += ' . ';
          } else {
            string += '   ';
          }
        } else if (ships[i][j] && ships[i][j].hit) {
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
    getShotsReceived: () => gameboard.getShotsReceived(),
    getShips: () => gameboard.getShips(),
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
