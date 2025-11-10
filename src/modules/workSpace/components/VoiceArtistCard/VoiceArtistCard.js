import React, { useContext } from "react";
import "./VoiceArtistCard.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useDispatch, useSelector } from "react-redux";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import likeDislikeArtist from "../../services/voiceDB/likeDislikeArtist";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import DefaultUser from "../../../../static/voice/default_user.png";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { SET_VOICE_LIST_META } from "../../redux/voicesListSlice";
import { ReactComponent as Mic } from "../../../../static/voice/mic.svg";
import { ReactComponent as Masks } from "../../../../static/voice/masks.svg";
import { ReactComponent as Voice } from "../../../../static/Timeline/timeline-voice.svg";
import getVoiceArtistTimelineColor from "../../../../utils/getVoiceArtistTimelineColor";
import { TTSVoiceTypes } from "../../constants/TTSVoiceTypes";
import {
  ASSET_PATHS,
  getBrandAssetPath,
} from "../../../../utils/getBrandAssetMeta";
import { TTS_STATUS } from "../../constants/TTSStatus";

const VoiceArtistCard = ({
  voice,
  clickedVoiceData,
  setClickedVoiceData,
  likedArtist,
  getTTSVoicesData,
  filteredItems,
  playingAudio,
  playPause,
}) => {
  const { selectedVoices, replaceVoiceMeta, disabledVoices } = useSelector(
    (state) => state?.voices
  );
  const { projectID } = useSelector((state) => state.projectMeta);
  const dispatch = useDispatch();
  let { brandMeta } = getCSUserMeta();

  const onLikeDislikeArtistSuccess = (res) => {
    dispatch(
      SET_VOICE_LIST_META({
        favVoicesList: res.data.UpdatedFavList || [],
      })
    );
    getTTSVoicesData({
      ...filteredItems,
      favVoices: res.data.UpdatedFavList,
    });
  };

  const likeDislikeSelectedArtist = (e, artist) => {
    e.stopPropagation();
    const favMeta = { favData: artist, projectId: projectID, type: 2 };
    likeDislikeArtist({
      favMeta,
      onSuccess: onLikeDislikeArtistSuccess,
    });
  };

  // const renderToolTip = (voice) => {
  //   return (
  //     <div className="tooltip_container">
  //       {/* <b>Tags:</b>
  //       <p style={{ margin: "4px 0px 10px 0px" }}>
  //         {voice[KEY_REF["tags"]]?.join(", ") || "-"}
  //       </p> */}
  //       <b>Style:</b>
  //       <p style={{ margin: "4px 0px 0px 0px" }}>
  //         {voice[KEY_REF["speakingStyles"]]?.join(", ") || "-"}
  //       </p>
  //     </div>
  //   );
  // };

  let isAlreadyUsed = selectedVoices
    ?.map((voice) => voice.voiceId)
    ?.includes(voice[KEY_REF["voiceId"]]);

  const isVoiceDisabled = disabledVoices?.includes(voice[KEY_REF["voiceId"]]);

  const isBookmarked = likedArtist?.includes(voice[KEY_REF["voiceId"]]);

  return (
    <div
      onClick={() => {
        if (isVoiceDisabled) return;
        setClickedVoiceData({
          voiceId: voice[KEY_REF["voiceId"]],
          artistName: voice[KEY_REF["artistName"]],
          picture: voice[KEY_REF["picture"]],
          gender: voice[KEY_REF["gender"]],
          color: getVoiceArtistTimelineColor(voice[KEY_REF["artistName"]]),
          voiceProvider: voice[KEY_REF["voiceProvider"]],
          content: [],
          ...(brandMeta?.profanity && {
            langCode: voice[KEY_REF["languageId"]],
          }),
        });
      }}
      className={`voice_card_container ${
        isVoiceDisabled ? "disabled_voice" : ""
      } ${
        clickedVoiceData?.voiceId === voice[KEY_REF["voiceId"]]
          ? "voice_card_selected_container"
          : replaceVoiceMeta?.voiceId
          ? replaceVoiceMeta?.voiceId === voice[KEY_REF["voiceId"]]
            ? "voice_card_replaced_container"
            : "voice_card_default_container"
          : isAlreadyUsed
          ? "voice_card_already_used_container"
          : "voice_card_default_container"
      }`}  
      data-vp={voice[KEY_REF["voiceProvider"]]}
    >
      {isVoiceDisabled && (
        <div className="voice_card_disabled_overlay">
          <p className="voice_card_disabled_overlay_text">
            This voice is disabled
          </p>
        </div>
      )}
      <div className="voice_card_left">
        <div className="voice_provider">
          <span>{voice[KEY_REF["voiceProvider"]]}</span>
        </div>
        <LazyLoadImage
          className="artistImg"
          src={voice[KEY_REF["picture"]]}
          alt={voice[KEY_REF["artistName"]]}
          effect="black-and-white"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DefaultUser;
          }}
        />
        {voice[KEY_REF["isOnBrand"]] === 1 && (
          <LazyLoadImage
            className="brandVoice"
            src={getBrandAssetPath(ASSET_PATHS?.BRAND_VOICE_LOGO_PATH)}
            alt={"brandVoice"}
          />
        )}
      </div>
      <div className="voice_card_right">
        <div className="voice_card_title_container ">
          <CustomToolTip
            title={`${voice[KEY_REF["artistName"]]} (${voice[
              KEY_REF["gender"]
            ]?.[0]?.toLowerCase()})`}
          >
            <span
              className="artistName"
              data-shortname={voice[KEY_REF["voiceId"]]}
            >
              {voice[KEY_REF["artistName"]]}
              {!!voice[KEY_REF["gender"]] &&
                ` (${voice[KEY_REF["gender"]]?.[0]?.toLowerCase()})`}
            </span>
          </CustomToolTip>
          <div style={{ display: "flex", gap: "10px" }}>
            <IconWrapper
              icon={isBookmarked ? "BookmarkFilled" : "Bookmark"}
              className={`voice_card_icon_large ${
                isBookmarked ? "bookmark" : "unbookmark"
              }`}
              onClick={(e) => {
                e?.stopPropagation();
                likeDislikeSelectedArtist(e, voice[KEY_REF["voiceId"]]);
              }}
            />
            {voice[KEY_REF["voiceId"]] !== playingAudio?.playingIndex ||
            !playingAudio?.isPlaying ? (
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  playPause({
                    mp3: voice[KEY_REF["audioSample"]],
                    id: voice[KEY_REF["voiceId"]],
                  });
                }}
                className={`voice_sample_play_pause`}
                disabled={
                  !voice[KEY_REF["audioSample"]] ||
                  (voice[KEY_REF["voiceId"]] === playingAudio?.playingIndex &&
                    playingAudio?.isLoading)
                }
              >
                <IconWrapper
                  icon="Speaker"
                  className="voice_card_icon_large play_icon"
                />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  playPause({
                    mp3: voice[KEY_REF["audioSample"]],
                    id: voice[KEY_REF["voiceId"]],
                  });
                }}
                className={`voice_sample_play_pause`}
              >
                <IconWrapper
                  icon="Pause"
                  className="voice_card_icon_large pause_icon"
                  style={{
                    scale: "1.1",
                  }}
                />
              </button>
            )}
          </div>
        </div>
        <div className="voice_card_audio_player_container cs_imagr_icon">
          <div className="voice_meta_container ">
            <div className="voice_card_tags_header_summary">
              <IconWrapper icon="Language" className="voice_card_icon_small" />
              <span>{voice[KEY_REF["language"]]}</span>
            </div>
            <div className="voice_card_tags_header_summary">
              <IconWrapper icon="Accent" className="voice_card_icon_small" />
              <span>{voice[KEY_REF["accent"]]}</span>
            </div>
            <div className="voice_card_tags_header_summary">
              <IconWrapper icon="Age" className="voice_card_icon_small" />
              <span>{voice[KEY_REF["age"]]}</span>
            </div>
          </div>
          {/* <CustomToolTip
            title={renderToolTip(voice)}
            placement="top"
            className="tooltip"
          >
            <Info className="tooltip voice_card_icon_large" />
          </CustomToolTip> */}
          <CustomToolTip
            title={
              voice[KEY_REF["voiceType"]] === TTSVoiceTypes.STUDIO_QUALITY
                ? "Studio Quality"
                : "Multi-expressive"
                // : voice[KEY_REF["voiceType"]] === TTSVoiceTypes.MULTI_EXPRESSIVE
                // ? "Multi-expressive"
                // : "Professional"
            }
            placement="top"
            className="tooltip"
          >
            {voice[KEY_REF["voiceType"]] === TTSVoiceTypes.STUDIO_QUALITY ? (
              <Mic className="tooltip voice_card_icon_large" />
            ) : voice[KEY_REF["voiceType"]] ===
              TTSVoiceTypes.MULTI_EXPRESSIVE ? (
              <Masks className="tooltip voice_card_icon_large" />
            ) 
            : 
            // voice[KEY_REF["voiceType"]] === TTSVoiceTypes.PROFESSIONAL ? (
            //   <Voice className="tooltip voice_card_icon_large" />
            // ) : 
            (
              <></>
            )}
          </CustomToolTip>
        </div>
      </div>
    </div>
  );
};

export default VoiceArtistCard;