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

    return opponent.gameboard.receiveAttack(x, y);
  };

  const shootAuto = () => {
    if (!opponent) throw new Error('No opponent set');

    const emptySpaces = [];
    const opponentShotsReceived = opponent.gameboard.getShotsReceived();
    for (let i = 0; i < DIMENSION; i++) {
      for (let j = 0; j < DIMENSION; j++) {
        if (opponentShotsReceived[i][j] === false) {
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

  return {
    // TODO only expose the gameboard methods which should be used by the GameController, not everything.
    gameboard,
    getName: () => name,
    getIsAi: () => isAi,
    setOpponent,
    getOpponent: () => opponent,
    shoot,
    shootAuto,
  };
};

export default Player;
