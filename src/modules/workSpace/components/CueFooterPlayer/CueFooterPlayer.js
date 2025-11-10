import React from "react";
import "./CueFooterPlayer.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { useDispatch, useSelector } from "react-redux";
import {
  RESET_CUE_TRACK_META,
  SET_CUE_TRACK_META,
} from "../../redux/tableSlice";

const CueFooterPlayer = () => {
  const dispatch = useDispatch();
  const { cueTrackMeta } = useSelector((state) => state.table);

  const closeCueFooterPlayer = () => {
    dispatch(RESET_CUE_TRACK_META());
  };

  const updateCueFooterPlayerMeta = (cueFooterPlayerMeta) => {
    dispatch(SET_CUE_TRACK_META(cueFooterPlayerMeta));
  };

  return (
    <div
      className={`CueFooterPlayer_container ${
        !!cueTrackMeta?.src ? "" : "hide_cueFooterPlayer_container"
      }`}
    >
      <div className="cue_track_title">{cueTrackMeta?.title}</div>
      <audio
        src={cueTrackMeta?.src}
        controls
        id="cue_track_player"
        onPlay={() => updateCueFooterPlayerMeta({ isPlaying: true })}
        onPause={() => updateCueFooterPlayerMeta({ isPlaying: false })}
        controlsList="nodownload noplaybackrate"
        onLoadedMetadata={(e) => {
          updateCueFooterPlayerMeta({ isLoading: false, isPlaying: true });
          e.target.pause();
          e.target.currentTime = 0;
          setTimeout(() => {
            e.target.play();
          }, 100);
        }}
        onError={() => updateCueFooterPlayerMeta({ isLoading: false })}
      />
      <IconWrapper
        icon="Close"
        className="cue_track_player_close_btn"
        onClick={closeCueFooterPlayer}
      />
    </div>
  );
};

export default CueFooterPlayer;
