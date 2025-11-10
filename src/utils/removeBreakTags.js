export default function removeBreakTags(str) {
  return str.replace(/<break time\s*=\s*["']\d+(\.\d+)?s["']\s*\/?>/gi, "");
}
