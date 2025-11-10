export const jsonDataModifier = (metaData) => {
    if (!metaData) return null; // Handle case when metaData is undefined/null

    try {
        let fixedJsonString = metaData
            .replace(/([{,])(\s*)([a-zA-Z_]+)(\s*):/g, '$1"$3":') // Add quotes around keys
            .replace(/:\s*([^"\[{][^,}\]]*)/g, ': "$1"') // Add quotes around string values if missing
            .replace(/"score":\s*"(\d+)-(\d+)"/g, '"score": "$1-$2"'); // Convert score to an array

        return JSON.parse(fixedJsonString);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    }
};