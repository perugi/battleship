const Ship = (length) => {
  if (length < 1) {
    throw new Error('Ship length must be greater than 0');
  }
  let hits = 0;
  let isSunken = false;

  const hit = () => {
    if (isSunken) {
      throw new Error('Ship is already sunken');
    }

    hits += 1;

    if (hits === length) {
      isSunken = true;
    }
  };

  return {
    getLength: () => length,
    isSunk: () => isSunken,
    hit,
  };
};

export default Ship;
