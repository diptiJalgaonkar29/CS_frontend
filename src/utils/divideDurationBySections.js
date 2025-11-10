function divideDurationBySections(
  sectionCount,
  totalAmount,
  firstSectionLimit = 0
) {
  console.log(
    "divideDurationBySections***",
    sectionCount,
    totalAmount,
    firstSectionLimit
  );

  if (sectionCount <= 0) {
    throw new Error("Section count must be greater than 0.");
  }

  // Special case: only one section
  if (sectionCount === 1) {
    return [totalAmount];
  }

  const result = new Array(sectionCount).fill(0);

  // Set the first section amount
  result[0] = Math.min(totalAmount, firstSectionLimit);

  // Calculate remaining amount
  let remainingAmount = totalAmount - result[0];

  // Distribute the remaining amount across other sections
  for (let i = 1; i < sectionCount; i++) {
    const share = remainingAmount / (sectionCount - i); // Distribute proportionally
    result[i] = share;
    remainingAmount -= share;
  }

  // Special case: Ensure the last section is not 0
  if (result[sectionCount - 1] === 0) {
    const adjustAmount = 5; // Minimum amount for the last section
    result[sectionCount - 1] = adjustAmount;

    // Adjust from other sections, starting from the first section
    for (let i = 0; i < sectionCount - 1; i++) {
      if (result[i] >= adjustAmount) {
        result[i] -= adjustAmount;
        break;
      }
    }
  }

  return result.map((value) => parseFloat(value.toFixed(2))); // Ensure two decimal precision
}

export default divideDurationBySections;

// Example Usage

// var divide1 = divideDurationBySections(3, 90, 63.3);
// console.log(divide1);
// let divide2 = divideDurationBySections(2, 60, 63.3);
// console.log(divide2); // [55, 5]
