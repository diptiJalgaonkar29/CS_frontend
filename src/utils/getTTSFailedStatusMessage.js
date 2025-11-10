const getTTSFailedStatusMessage = (statusMessage) => {
  switch (statusMessage) {
    case "max_character_limit_exceeded":
      return "Max character limit exceeded, try again";

    default:
      return "Request failed, try again";
  }
};

export default getTTSFailedStatusMessage;
