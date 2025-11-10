const wordCapitalizer = (str) => {
  if (typeof str !== "string" || !str) {
    return "-";
  }
  let wordCapitalized = str
    ?.split(" ")
    ?.map(
      (word) => word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase()
    )
    ?.join(" ");
  return wordCapitalized;
};

export default wordCapitalizer;
