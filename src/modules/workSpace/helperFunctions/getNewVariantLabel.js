const getNewVariantLabel = (recentAIGeneratedData, previousCueID) => {
  let prevTrack =
    recentAIGeneratedData?.find(
      (trackMeta) => trackMeta?.value === previousCueID
    )?.label || recentAIGeneratedData?.[0]?.label;
  let prevVariant = prevTrack?.label?.toString()?.split(".")?.[0] || 0;
  let prevSubVariant = prevTrack?.label?.toString()?.split(".")?.[1] || 0;
  let newVariantLabel;
  if (prevVariant == 0) {
    newVariantLabel = 1;
  } else {
    newVariantLabel = `${prevVariant}.${+prevSubVariant + 1}`;
  }
  return newVariantLabel;
};

export default getNewVariantLabel;
