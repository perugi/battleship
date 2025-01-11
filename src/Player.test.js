import Player from './Player';
import { countHitsOnBoard } from './testHelpers';

describe('Player tests', () => {
  it('instantiates a human player with a name', () => {
    const player = Player('Player', false, 10);
    expect(player.getName()).toBe('Player');
    expect(player.getIsAi()).toBe(false);
  });

  it('instantiates an AI player with a name', () => {
    const player = Player('Computer', true, 10);
    expect(player.getName()).toBe('Computer');
    expect(player.getIsAi()).toBe(true);
  });

  it('instantiates a player with a default gameboard of 10x10 and empty', () => {
    const player = Player('Player', false);
    expect(player.getShips().length).toBe(10);
    expect(
      player.getShips().every((col) => col.every((el) => el === null))
    ).toBe(true);
    expect(
      player.getShotsReceived().every((col) => col.every((el) => el === false))
    ).toBe(true);
  });

  it('sets the players opponent', () => {
    const player = Player('Player', false);
    const opponent = Player('Computer', true);
    expect(player.getOpponent()).toBe(null);
    player.setOpponent(opponent);
    expect(player.getOpponent()).toBe(opponent);
  });

  it('prints player data', () => {
    const player = Player('Player', false);
    expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
    player.placeShip(2, 0, 0, 'v');
    expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   O | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
   O | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
   . | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
    player.receiveAttack(0, 0);
    expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   X | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
   O | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
   . | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
    player.receiveAttack(1, 0);
    expect(player.toString()).toBe(`
  Name: Player, isAi: false

  Gameboard:
   X | - |   |   |   |   |   |   |   |   |
  ----------------------------------------
   O | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
   . | . |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
     |   |   |   |   |   |   |   |   |   |
  ----------------------------------------
`);
  });

  it('allows a manual attack', () => {
    const computer = Player('Computer', true);
    const player = Player('Player', false);
    player.setOpponent(computer);
    expect(countHitsOnBoard(computer)).toBe(0);
    player.shoot(0, 0);
    expect(countHitsOnBoard(computer)).toBe(1);
    expect(computer.getShotsReceived()[0][0]).toBe(true);
  });

  it('allows an auto attack', () => {
    const computer = Player('Computer', true, 10);
    const player = Player('Player', false, 10);
    computer.setOpponent(player);
    expect(countHitsOnBoard(player)).toBe(0);
    computer.shootAuto(0);
    expect(countHitsOnBoard(player)).toBe(1);
  });

  it('returns true and shot coords when shot is a hit and returns false and shot coords when shot is a miss', () => {
    const computer = Player('Computer', true);
    const player = Player('Player', false);
    player.setOpponent(computer);
    computer.placeShip(2, 0, 0, 'v');
    expect(player.shoot(0, 0)).toEqual([true, 0, 0]);
    expect(player.shoot(1, 0)).toEqual([false, 1, 0]);
  });

  it('throws when human shoots if no opponent is set', () => {
    const player = Player('Player', false);
    expect(() => {
      player.shoot(0, 0);
    }).toThrow('No opponent set');
  });

  it('throws when AI shoots if no opponent is set', () => {
    expect.assertions(1);
    const player = Player('Player', true, 10);
    expect(() => {
      player.shootAuto(0);
    }).toThrow('No opponent set');
  });

  it('throws when AI cannot find an empty space to shoot', () => {
    //   expect.assertions(2);
    const computer = Player('Computer', true, 10);
    const player = Player('Player', false, 10);
    computer.setOpponent(player);
    for (let i = 0; i < 100; i++) {
      computer.shootAuto(0);
    }
    expect(countHitsOnBoard(player)).toBe(100);
    try {
      computer.shootAuto(0);
    } catch (error) {
      expect(error.message).toBe('No empty spaces left');
    }
  });
});
