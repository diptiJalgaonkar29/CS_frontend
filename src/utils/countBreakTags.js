function countBreakTags(inputString, voiceProvider) {
  const allMatches =
    inputString.match(/<break\s+time\s*=\s*"([^"]+)"\s*\/?>/g) || [];

  const invalidMatches = [];

  for (const match of allMatches) {
    const timeMatch = match.match(/time\s*=\s*"([^"]+)"/);
    const timeValue = timeMatch ? timeMatch[1] : null;

    const isSelfClosing = /\/>$/.test(match.trim());
    const isNormalClosing = />$/.test(match.trim()) && !isSelfClosing;

    let isValid = false;

    if (voiceProvider === "elevenLabs") {
      // Accept integer (e.g., 2s) or single decimal (e.g., 2.7s), not more (e.g., 2.76s)
      isValid = /^\d+(\.\d)?s$/.test(timeValue) && isNormalClosing;
    } else {
      // Accept only integers like 2s, and only self-closing
      isValid = /^\d+s$/.test(timeValue) && isSelfClosing;
    }

    if (!isValid) {
      invalidMatches.push(match);
    }
  }

  return invalidMatches.length > 0;
}

export default countBreakTags;
