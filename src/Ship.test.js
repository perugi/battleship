import Ship from './Ship';

describe('Ship tests', () => {
  it('applies the correct length at instantiation', () => {
    const ship = Ship(3);
    expect(ship.getLength()).toBe(3);
  });

  it('sinks when receiving number of hits equaling its length', () => {
    const ship = Ship(3);
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  it('throws when trying to hit a sunken ship', () => {
    const ship = Ship(1);
    ship.hit();
    expect(() => {
      ship.hit();
    }).toThrow('Ship is already sunken');
  });

  it('throws when creating a ship with invalid length', () => {
    expect(() => {
      Ship(0);
    }).toThrow('Ship length must be greater than 0');
    expect(() => {
      Ship(-1);
    }).toThrow('Ship length must be greater than 0');
    expect(() => {
      Ship(1.2);
    }).toThrow('Ship length must be an integer');
    expect(() => {
      Ship('a');
    }).toThrow('Ship length must be an integer');
  });
});
