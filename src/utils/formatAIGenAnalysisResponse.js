import getTempoCategory from "../modules/workSpace/helperFunctions/getTempoCategory";

export function formatAIGenAnalysisResponse(input) {
  const result = [];

  function handleItem(item) {
    // Case 1: comma-separated string like "genre, mood, bpm"
    if (typeof item === "string") {
      const parts = item.split(",").map((s) => s.trim());
      if (parts.length !== 3) return;

      const [genre, mood, bpmRange] = parts;
      const bpmMatch = bpmRange.match(/^(\d+)-(\d+)\s*BPM$/i);
      if (!bpmMatch) return;

      result.push([genre, mood, getTempoCategory(bpmRange)]);
    }

    // Case 2: array of [genre, mood, bpm]
    else if (Array.isArray(item)) {
      if (item.length === 3 && item.every((v) => typeof v === "string")) {
        const [genre, mood, bpmRange] = item.map((s) => s.trim());
        const bpmMatch = bpmRange.match(/^(\d+)-(\d+)\s*BPM$/i);
        if (!bpmMatch) return;

        result.push([genre, mood, getTempoCategory(bpmRange)]);
      } else {
        // Recursively handle nested arrays (like test3)
        item.forEach(handleItem);
      }
    }
  }

  input.forEach(handleItem);

  return result;
}
