import React from "react";
import {
  ADD_SUBTEXT,
  ADD_VOICE,
  SET_VOICE_META,
} from "../../redux/voicesSlice";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Menu, MenuItem } from "@mui/material";
import Add from "../../../../static/common/add_border.svg";
import { v4 as uuidv4 } from "uuid";
import { TTS_STATUS } from "../../constants/TTSStatus";
import { LazyLoadImage } from "react-lazy-load-image-component";
import DefaultUser from "../../../../static/voice/default_user.png";
import "./AddVoiceMenu.css";
import { ElevenLabsVoiceProvider } from "../../constants/VoiceProviders";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { PROFANITY_STATUS } from "../../constants/profanityStatus";
import getVoiceArtistTimelineColor from "../../../../utils/getVoiceArtistTimelineColor";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const getselectedUniqueVoicesArr = (selectedVoices) => {
  return [
    ...new Map(selectedVoices?.map((item) => [item["voiceId"], item])).values(),
  ];
};

const AddVoiceMenu = () => {
  const dispatch = useDispatch();
  const { selectedVoices, disabledVoices } = useSelector(
    (state) => state?.voices
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const addVoice = (data) => {
    handleClose();
    let { brandMeta } = getCSUserMeta();
    let langCode = data?.content?.[0]?.langCode;
    let voiceProvider = data?.content?.[0]?.voiceProvider;
    dispatch(
      ADD_VOICE({
        voiceId: data?.voiceId,
        picture: data?.picture,
        color: getVoiceArtistTimelineColor(data?.artistName),
        gender: data?.gender,
        artistName: data?.artistName,
        content: [
          {
            content: "",
            voice: data?.voiceId,
            color: getVoiceArtistTimelineColor(data?.artistName),
            gender: data?.gender,
            mp3: "",
            artistName: data?.artistName,
            duration: 0,
            voiceUUID: uuidv4(),
            voiceProvider,
            ...(brandMeta?.profanity && {
              expletiveWordCount: null,
              ampProfanity: null,
              expletiveWords: null,
              profanityStatus: PROFANITY_STATUS.NOT_STARTED,
              langCode,
            }),
            ...(voiceProvider !== ElevenLabsVoiceProvider
              ? { speed: "1", pitch: "1" }
              : {
                  stability: "0.5",
                  similarityBoost: "0.7",
                  style: "0",
                  useSpeakerBoost: true,
                }),
            speakingStyle: "general",
            index: 0,
            voiceIndex: selectedVoices?.length || 0,
            status: TTS_STATUS.NOT_STARTED,
            statusMessage: "",
          },
        ],
      })
    );
  };
  const handleClickOpen = () => {
    dispatch(
      SET_VOICE_META({
        isVoiceListModalOpen: true,
        voiceListModalAction: "ADD_VOICE",
      })
    );
  };
  return (
    <>
      <IconWrapper
        icon="AddBordered"
        className="addTextBoxIcon"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      />
      <Menu
        id="voice_add_menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            let { brandMeta } = getCSUserMeta();
            dispatch(ADD_SUBTEXT({ profanity: brandMeta?.profanity }));
            handleClose();
          }}
        >
          Add More Input
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClickOpen();
            handleClose();
          }}
        >
          Add New Voice
        </MenuItem>
        <Divider />
        <div className="selected_voice_menu_img_container">
          {getselectedUniqueVoicesArr(selectedVoices)?.map(
            (data, indexNumber) => {
              const isVoiceDisabled = disabledVoices?.includes(data?.voiceId);
              return (
                <LazyLoadImage
                  className={`selected_voice_menu_img ${
                    isVoiceDisabled ? "disabled_voice" : ""
                  }`}
                  style={{
                    border: `2px solid ${
                      data?.color ||
                      (data?.color === "Male"
                        ? "var(--color-male-voice)"
                        : "var(--color-female-voice)")
                    }`,
                  }}
                  key={`voice_block_${indexNumber}`}
                  alt={"picture"}
                  effect="blur"
                  src={data?.picture}
                  onClick={() => {
                    if (isVoiceDisabled) return;
                    addVoice(data);
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DefaultUser;
                  }}
                />
              );
            }
          )}
        </div>
      </Menu>
    </>
  );
};

export default AddVoiceMenu;
