var pad = function (num, size) {
  return ("000" + num).slice(size * -1);
};

const formatTime = (timeInSeconds, showMilliseconds = false) => {
  let time = parseFloat(timeInSeconds).toFixed(3);
  let minutes = Math.floor(time / 60) % 60;
  let seconds = Math.floor(time - minutes * 60);
  let milliseconds = time.slice(-3);
  let formattedStr;
  if (showMilliseconds) {
    formattedStr =
      pad(minutes, 2) + ":" + pad(seconds, 2) + "." + milliseconds.slice(0, 1);
  } else {
    formattedStr = pad(minutes, 2) + ":" + pad(seconds, 2);
  }
  return formattedStr;
};

export default formatTime;
