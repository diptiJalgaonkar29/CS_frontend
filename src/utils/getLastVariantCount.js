const getLastVariantCount = (recentAIGeneratedData) => {
  // console.log("recentAIGeneratedData", recentAIGeneratedData);
  if (!recentAIGeneratedData || recentAIGeneratedData?.length === 0) {
    return 0;
  }
  let lastVariantCount;
  let numbers;
  try {
    numbers =
      recentAIGeneratedData?.map((data) => {
        const splitString = data.label?.split("##");
        const numberString = splitString?.[0]?.replace("Variant ", "");
        return parseInt(numberString);
      }) ?? 0;

    lastVariantCount = Math.max(...numbers) ?? 0;
  } catch (error) {
    lastVariantCount = 0;
  }
  if (isNaN(lastVariantCount)) {
    return 0;
  }
  // console.log("lastVariantCount", lastVariantCount);
  // console.log("numbers", numbers);
  // console.log("Math.max(...numbers)", Math.max(...numbers));
  return lastVariantCount;
};

export default getLastVariantCount;
