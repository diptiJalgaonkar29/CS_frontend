export const getHighScore = (meta) => {
    if (!Array.isArray(meta) || meta.length === 0) return null; // Handle empty or invalid input

    const highestScoreObj = meta.reduce((max, item) =>
        item.score > max.score ? item : max
        , meta[0]); // Initial value to avoid empty array issue

    return highestScoreObj?.Keyword || null; // Return null if Keyword is undefined
};