import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InstrumentItem from "../InstrumentItem/InstrumentItem";
import { InstrumentTypes } from "../../constants/InstrumentTypes";
import "./InstrumentsPanel.css";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import { isEqual } from "lodash";

const InstrumentsPanel = () => {
  const [instrumentData, setInstrumentData] = useState([]);
  const { selectedAIMusicDetails, stemVolume } = useSelector(
    (state) => state.AIMusic
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!!selectedAIMusicDetails?.cue_id) {
      getInstrumetData();
    }
  }, [selectedAIMusicDetails?.cue_id]);

  const getInstrumetData = () => {
    let stemDataArr = [];
    Object.keys(selectedAIMusicDetails)
      .filter((key) => {
        return (
          key.startsWith("stem_") &&
          key.endsWith("_audio_file_url") &&
          !key.includes("percussion") &&
          !key.includes("effect")
        );
      })
      ?.reduce((obj, key) => {
        obj[key] = selectedAIMusicDetails[key];
        stemDataArr.push({
          instrumentKey: InstrumentTypes[key.split("_")[1]],
          fileUrl: obj[key],
          instrument: key.split("_")[1],
        });
        return obj;
      }, {});
    const stemDataArrWithVolume = stemDataArr?.map((data) => ({
      ...data,
      volume: selectedAIMusicDetails?.volumes?.[0]?.[data?.instrumentKey],
    }));
    setInstrumentData(stemDataArrWithVolume);
  };

  const resetInstrumentBtnClicked = () => {
    dispatch(
      SET_AI_MUSIC_META({ stemVolume: selectedAIMusicDetails?.volumes?.[0] })
    );
  };

  return (
    <div className={`instrument-panel`} id={`instrument-panel`}>
      {instrumentData?.map((item, i) => (
        <InstrumentItem key={item?.instrument} index={i} {...item} />
      ))}
      <div className="instrument_reset_changes_btn_container">
        <button
          className="instrument_reset_changes_btn"
          onClick={resetInstrumentBtnClicked}
          disabled={isEqual(stemVolume, selectedAIMusicDetails?.volumes?.[0])}
        >
          Reset changes
        </button>
      </div>
    </div>
  );
};

export default InstrumentsPanel;
