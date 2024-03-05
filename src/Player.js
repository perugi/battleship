import Gameboard from './Gameboard';

const DIMENSION = 10;

const Player = (name, isAi) => {
  const gameboard = new Gameboard(DIMENSION);

  let opponent = null;

  const setOpponent = (newOpponent) => {
    opponent = newOpponent;
  };

  const shoot = (x, y) => {
    if (!opponent) throw new Error('No opponent set');

    return opponent.receiveAttack(x, y);
  };

  const shootAuto = () => {
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
      shoot(randomEmptySpace[0], randomEmptySpace[1]);
    } else {
      throw new Error('No empty spaces left');
    }
  };

  const toString = () => {
    let string = `\n  Name: ${name}, isAi: ${isAi}\n\n`;

    string += `  Gameboard:\n`;

    const shotsReceived = gameboard.getShotsReceived();
    const ships = gameboard.getShips();

    for (let i = 0; i < DIMENSION; i++) {
      string += '  ';
      for (let j = 0; j < DIMENSION; j++) {
        if (ships[i][j] && !shotsReceived[i][j]) {
          string += ' O ';
        } else if (ships[i][j] && shotsReceived[i][j]) {
          string += ' X ';
        } else if (!ships[i][j] && shotsReceived[i][j]) {
          string += ' - ';
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
    getShotsReceived: () => gameboard.getShotsReceived(),
    getShips: () => gameboard.getShips(),
    placeShip: (...args) => gameboard.placeShip(...args),
    removeShip: (...args) => gameboard.removeShip(...args),
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
