const Ship = (length) => {
  if (!Number.isInteger(length)) {
    throw new Error('Ship length must be an integer');
  }
  if (length < 1) {
    throw new Error('Ship length must be greater than 0');
  }
  let hits = 0;
  let isSunk = false;

  const hit = () => {
    if (isSunk) {
      throw new Error('Ship is already sunken');
    }

    hits += 1;

    if (hits === length) {
      isSunk = true;
    }
  };

  return {
    getLength: () => length,
    isSunk: () => isSunk,
    hit,
  };
};

export default Ship;
