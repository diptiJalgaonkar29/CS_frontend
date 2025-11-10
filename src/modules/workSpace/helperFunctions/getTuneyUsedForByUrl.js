const getTuneyUsedForByUrl = (url, method) => {
  if (url?.endsWith("/configs")) {
    return "tuney-configs";
  } else if (url?.endsWith("/resample")) {
    return "tuney-regenerate";
  } else if (url?.startsWith("/tasks/v3/generate/")) {
    return "tuney-generate";
  } else if (url === "/cues/v3/" && method === "post") {
    return "tuney-generateTaskId";
  } else if (url?.startsWith("/cues/v3/") && method === "get") {
    return "tuney-cueIdDetails";
  } else if (url?.includes("/variations?k=")) {
    return "tuney-variations";
  } else {
    return "tuney";
  }
};

export default getTuneyUsedForByUrl;
