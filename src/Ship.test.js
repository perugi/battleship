import Ship from './Ship';

test('Ship length', () => {
  const ship = Ship(3);
  expect(ship.getLength()).toBe(3);
});

test('Ship isSunk', () => {
  const ship = Ship(3);
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
  ship.hit();
  expect(ship.isSunk()).toBe(true);
})

test('Hit sunken ship', () => {
  const ship = Ship(1);
  ship.hit();
  expect(() => {
    ship.hit();
  }).toThrow();
})

test('Ship zero length', () => {
  expect(() => {
    Ship(0);
  }).toThrow();
})