const getAIMusicEndingOption = (trackEnding) => {
  return trackEnding === "stab"
    ? { label: "short", value: "short" }
    : { label: "fade out", value: "fade_out" };
};

export default getAIMusicEndingOption;
