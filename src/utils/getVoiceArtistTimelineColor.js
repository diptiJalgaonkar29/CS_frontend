import { store } from "../reduxToolkit/store";

let style = window.getComputedStyle(document.body);
let colorArray = new Array(30)
  .fill("")
  .map(
    (color, index) =>
      `${style.getPropertyValue("--color-voice-" + (index + 1))}`
  )
  ?.filter(Boolean);

const getVoiceArtistTimelineColor = (artist) => {
  console.log("colorArray", colorArray);
  const { voices } = store.getState();
  // Check for assigned colors
  const previousAssignedColor = voices?.selectedVoices?.find(
    (voice) => voice?.artistName === artist
  )?.color;
  console.log("previousAssignedColor", previousAssignedColor);
  if (!!previousAssignedColor) {
    return previousAssignedColor;
  }
  // Check for available colors
  const usedColors = new Set(
    voices?.selectedVoices?.map((data) => data?.color)
  );
  console.log("usedColors", usedColors);
  const availableColor = colorArray.find((color) => !usedColors.has(color));
  console.log("availableColor", availableColor);
  if (!!availableColor) {
    return availableColor;
  } else {
    let randomIndex = Math.floor(Math.random() * 23);
    console.log(
      "No more unique colors available! ",
      randomIndex,
      colorArray[randomIndex]
    );
    return colorArray[randomIndex];
  }
};

export default getVoiceArtistTimelineColor;
