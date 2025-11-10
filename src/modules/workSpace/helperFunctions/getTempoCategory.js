const tempoRange = {
  Slow: { min: 1, max: 92 },
  Fast: { min: 93, max: 200 },
};

function getTempoCategory(input) {
  if (!input) return "slow"; // Default to "slow" if tempoString is empty
  // Extract all numbers from the input string
  const numbers = input.match(/\d+/g)?.map(Number) || [];

  // If no valid numbers found, default to "slow"
  if (numbers.length === 0) return "slow";

  // Check if all tempos fall within the "Fast" range
  const isFast = numbers.every(
    (n) => n >= tempoRange.Fast.min && n <= tempoRange.Fast.max
  );

  // Check if all tempos fall within the "Slow" range
  const isSlow = numbers.every(
    (n) => n >= tempoRange.Slow.min && n <= tempoRange.Slow.max
  );

  if (isFast) return "fast";
  if (isSlow) return "slow";

  // Mixed or out of range defaults to "slow"
  return "slow";
}

export default getTempoCategory;
