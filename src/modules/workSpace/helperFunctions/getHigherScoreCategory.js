export function getHigherScoreCategory(jsonString) {
    if (!Array.isArray(jsonString) || jsonString.length === 0) return null; // Handle empty or invalid input

    return jsonString.reduce((max, curr) => {
        const maxScore = max?.score?.[1] ?? -Infinity; // Ensure max.score[1] exists
        const currScore = curr?.score?.[1] ?? -Infinity; // Ensure curr.score[1] exists

        return currScore > maxScore ? curr : max;
    }, jsonString[0]); // Set initial value to avoid reduce errors
}