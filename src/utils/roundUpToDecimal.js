const roundUpToDecimal = (floatValue, roundUpTo = 2) => {
  let roundUpDecimalValue;
  try {
    roundUpDecimalValue = parseFloat(floatValue).toFixed(roundUpTo);
    roundUpDecimalValue = +roundUpDecimalValue;
  } catch (error) {
    roundUpDecimalValue = 0;
  }
  if (isNaN(roundUpDecimalValue)) {
    roundUpDecimalValue = 0;
  }
  return roundUpDecimalValue;
};

export default roundUpToDecimal;
