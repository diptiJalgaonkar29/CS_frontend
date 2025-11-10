import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const SonicLogoItem = ({
  data,
  audioCommonRef,
  playPause,
  setPlayingAudio,
  playingAudio,
  setIsSonicLogoModalOpen,
  setSonicLogoMeta,
}) => {
  const { playedSonicLogo, sonicLogoId } = useSelector(
    (state) => state.AIMusic
  );
  const dispatch = useDispatch();
  const [mp3Blob, setMp3Blob] = useState("");

  const loadmp3Blob = async (mp3FileName) => {
    try {
      const mp3Res = await axiosSSPrivateInstance(
        `/tuneytracksoniclogo/getMp3OfSonicLogo/${mp3FileName}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(mp3Res?.data);
      setMp3Blob(url);
      return url;
    } catch (error) {
      console.log("loadmp3Blob error :: ", error);
    }
  };

  const onPlayPause = async (mp3FileName, tuneyLogoId) => {
    let mp3BlobUrl;
    if (!mp3Blob) {
      setPlayingAudio((prev) => ({
        ...prev,
        id: mp3FileName,
        isLoading: true,
      }));
      mp3BlobUrl = await loadmp3Blob(mp3FileName);
    } else {
      mp3BlobUrl = mp3Blob;
    }
    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: tuneyLogoId,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    playPause({
      mp3: mp3BlobUrl,
      id: mp3FileName,
    });
  };

  useEffect(() => {
    if (!playedSonicLogo && audioCommonRef.current?.id) {
      audioCommonRef.current.pause();
      setPlayingAudio((prev) => ({
        ...prev,
        isPlaying: false,
      }));
    }
  }, [playedSonicLogo]);

  const isLoadingAudio =
    data?.mp3FileName === playingAudio?.id && playingAudio?.isLoading;

  return (
    <>
      <div className="SonicLogoItem_container">
        <CustomToolTip title={data?.title}>
          <p className="SonicLogoItem_title">{data?.title}</p>
        </CustomToolTip>
        <div className="sonic_logo_audio_controls_container">
          {isLoadingAudio ? (
            <div className="sonic_logo_item_audio_loader">
              <CustomLoaderSpinner />
            </div>
          ) : (
            <>
              <button
                className="sonic_logo_play_pause_btn"
                onClick={() =>
                  onPlayPause(data?.mp3FileName, data?.tuneyLogoId)
                }
              >
                <IconWrapper
                  icon={
                    data?.mp3FileName !== playingAudio?.id ||
                    !playingAudio?.isPlaying
                      ? "BorderedPlay"
                      : "BorderedPause"
                  }
                  className={`sonic_logo_ctrlbtn`}
                />
              </button>
            </>
          )}
        </div>
        <ButtonWrapper
          size="s"
          onClick={() => {
            setSonicLogoMeta(data);
            setIsSonicLogoModalOpen(true);
          }}
        >
          {sonicLogoId === data?.tuneyLogoId
            ? "Edit this logo"
            : "Use this logo"}
        </ButtonWrapper>
      </div>
    </>
  );
};

export default SonicLogoItem;
