const countShips = (gameboard) => {
  const uniqueShips = new Set();

  gameboard.getShips().forEach((row) => {
    row.forEach((cell) => {
      if (cell) {
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
        totalSum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0),
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

export { countShips, countShipCells, countHitsOnBoard };
