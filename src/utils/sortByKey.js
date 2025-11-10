function sortByKey(array, key, type = "ASC") {
  if (!Array.isArray(array)) {
    throw new Error(`provided ${array} is not an array`);
  }
  return array.sort((a, b) => {
    let x;
    let y;
    if (key.includes("timestamp")) {
      x = new Date(a[key])?.getTime() || 0;
      y = new Date(b[key])?.getTime() || 0;
    } else {
      if (typeof a[key] === "number" || typeof b[key] === "number") {
        x = a[key] || 0;
        y = b[key] || 0;
      } else {
        x = a[key]?.toString()?.toLowerCase() || "";
        y = b[key]?.toString()?.toLowerCase() || "";
      }
    }
    if (type == "ASC") {
      return x < y ? -1 : x > y ? 1 : 0;
    } else {
      return x < y ? 1 : x > y ? -1 : 0;
    }
  });
}

export default sortByKey;
