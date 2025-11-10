function getAudioDuration(src) {
  return new Promise(function (resolve) {
    var au = document.createElement("audio");
    au.src = src;
    au.addEventListener(
      "loadedmetadata",
      function () {
        var duration = au.duration;
        resolve(au.duration);
      },
      false
    );
  });
}

export default getAudioDuration;
