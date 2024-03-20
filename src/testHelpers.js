const countShips = (gameboard) => {
  const uniqueShips = new Set();

  gameboard.getShips().forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell.hit) {
        uniqueShips.add(cell);
      }
    });
  });

  return uniqueShips.size;
};

const countShipCells = (gameboard) =>
  gameboard
    .getShips()
    .reduce(
      (totalSum, row) =>
        totalSum +
        row.reduce((rowSum, cell) => rowSum + (cell && cell.hit ? 1 : 0), 0),
      0
    );

function countHitsOnBoard(gameboard) {
  return gameboard
    .getShotsReceived()
    .reduce(
      (totalHitsOnBoard, row) =>
        totalHitsOnBoard +
        row.reduce((totalHitsInRow, el) => totalHitsInRow + (el === true), 0),
      0
    );
}

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export { countShips, countShipCells, countHitsOnBoard, delay };
