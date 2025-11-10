function randomIntFromInterval(min, max) {
  // min and max included
  if (isNaN(min) || isNaN(max)) return;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default randomIntFromInterval;
