const bytesToMegaBytes = (bytes) => {
  return +((bytes / 1024) * (1 / 1000)).toFixed(2);
};
export default bytesToMegaBytes;
