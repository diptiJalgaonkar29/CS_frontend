import formatTime from "../../../utils/formatTime";
import { AIMusicActions } from "../constants/AIMusicActions";
import getAIMusicEndingOption from "./getAIMusicEndingOption";
import { last } from "lodash";

const getAIMusicActionPerformed = (action, response) => {
  switch (action) {
    case AIMusicActions.ADD_DROP:
      return `drop added at ${formatTime(
        response?.cue_parameters?.transition?.time
      )}`;
    case AIMusicActions.ADD_ENDING:
      return `ending updated to ${
        getAIMusicEndingOption(last(response?.sections)?.ending)?.label
      }`;
    case AIMusicActions.ADD_DROP_AND_ENDING:
      return `drop added at ${formatTime(
        response?.cue_parameters?.transition?.time
      )} and ending updated to ${
        getAIMusicEndingOption(last(response?.sections)?.ending)?.label
      }`;
    case AIMusicActions.LENGTH_CHANGE:
      return `duration updated to ${formatTime(response?.settings?.length)}`;
    case AIMusicActions.INSTRUMENT_UPDATE:
      return `Instrument volume updated`;
    case AIMusicActions.ADD_DROP_AND_INSTRUMENT_UPDATE:
      return `drop added at ${formatTime(
        response?.cue_parameters?.transition?.time
      )} and instrument volume updated`;
    default:
      return "";
  }
};

export default getAIMusicActionPerformed;
