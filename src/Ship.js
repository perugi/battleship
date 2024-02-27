const Ship = (length) => {
  if (length < 1) {
    throw new Error('Ship length must be greater than 0');
  }
  let hits = 0;
  let isSunken = false;

  const getLength = () => length;

  const hit = () => {
    if (isSunken) {
      throw new Error('Ship is already sunken');
    }

    hits += 1;

    if (hits === length) {
      isSunken = true;
    }
  };

  const isSunk = () => isSunken;

  return {
    getLength,
    hit,
    isSunk,
  };
};

export default Ship;
