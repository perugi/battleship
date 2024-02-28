import Player from './Player';

test('Instantiate human player with name', () => {
  const player = Player('Player', false);
  expect(player.getName()).toBe('Player');
  expect(player.getIsAi()).toBe(false);
});

test('Instantiate AI player with name', () => {
  const player = Player('Computer', true);
  expect(player.getName()).toBe('Computer');
  expect(player.getIsAi()).toBe(true);
});

test('Default gameboard is 10x10 and empty', () => {
  const player = Player('Player', false);
  expect(player.gameboard.getDimension()).toBe(10);
  expect(
    player.gameboard.getShips().every((col) => col.every((el) => el === null))
  ).toBe(true);
  expect(
    player.gameboard
      .getShotsReceived()
      .every((col) => col.every((el) => el === false))
  ).toBe(true);
});

test('Set players opponent', () => {
  const player = Player('Player', false);
  const opponent = Player('Computer', true);
  player.setOpponent(opponent);
  expect(player.getOpponent()).toBe(opponent);
});

function countHitsOnBoard(board) {
  return board.reduce(
    (totalHitsOnBoard, row) =>
      totalHitsOnBoard +
      row.reduce((totalHitsInRow, el) => totalHitsInRow + (el === true), 0),
    0
  );
}

test('human player can manually attack', () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  player.setOpponent(computer);
  expect(countHitsOnBoard(computer.gameboard.getShotsReceived())).toBe(0);
  player.shoot(0, 0);
  expect(countHitsOnBoard(computer.gameboard.getShotsReceived())).toBe(1);
  expect(computer.gameboard.getShotsReceived()[0][0]).toBe(true);
});

test('AI player can automatically attack', () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  computer.setOpponent(player);
  expect(countHitsOnBoard(player.gameboard.getShotsReceived())).toBe(0);
  computer.shootAuto();
  expect(countHitsOnBoard(player.gameboard.getShotsReceived())).toBe(1);
});

test('when human shoots, if no opponents is set, exception is thrown', () => {
  const player = Player('Player', false);
  expect(() => {
    player.shoot(0, 0);
  }).toThrow('No opponent set');
});

test('when AI shoots, if no opponents is set, exception is thrown', () => {
  const player = Player('Player', true);
  expect(() => {
    player.shootAuto();
  }).toThrow('No opponent set');
});

test('When AI cannot find an empty space to shoot, exception is thrown', () => {
  const computer = Player('Computer', true);
  const player = Player('Player', false);
  computer.setOpponent(player);
  for (let i = 0; i < 100; i++) {
    computer.shootAuto();
  }
  expect(countHitsOnBoard(player.gameboard.getShotsReceived())).toBe(100);
  expect(() => {
    computer.shootAuto();
  }).toThrow('No empty spaces left');
});
