import React, { Fragment, useEffect } from "react";
import "./VoiceTab.css";
import VoiceArtistsModal from "../VoiceArtistsModal/VoiceArtistsModal";
import TextBoxes from "../TextBoxes/TextBoxes";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useDispatch, useSelector } from "react-redux";
import {
  SET_VOICE_META,
  UPDATE_TTS_PROFANITY_META,
} from "../../redux/voicesSlice";
import DictionaryModal from "../DictionaryModal/DictionaryModal";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import showNotification from "../../../../common/helperFunctions/showNotification";
import useTTSProcessedVoicePlayPause from "../../../../customHooks/useTTSProcessedVoicePlayPause";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import DefaultUser from "../../../../static/voice/default_user.png";
import getTTSProcessStatusV2 from "../../services/voiceExternal/getTTSProcessStatusV2";
import { SET_VOICE_LIST_META } from "../../redux/voicesListSlice";
import getFavVoicesList from "../../services/voiceDB/getFavVoicesList";
import getTTSVoicesV2 from "../../services/voiceExternal/getTTSVoicesV2";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import AddVoiceMenu from "../AddVoiceMenu/AddVoiceMenu";
import GenerateAllVoiceBtn from "../GenerateAllVoiceBtn/GenerateAllVoiceBtn";
import { useConfig } from "../../../../customHooks/useConfig";
import ProfanityModal from "../ProfanityModal/ProfanityModal";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import getPopularVoicesList from "../../services/voiceDB/getPopularVoicesList";
import { FormattedMessage } from "react-intl";
import { ReactComponent as InfoFilled } from "../../../../static/common/info_fiiled.svg";

const reqiredVoiceData = (arr1, arr2, filterBy) => {
  let res = [];
  res = arr1?.filter((el) => {
    return arr2?.find((element) => {
      return element === el[filterBy];
    });
  });
  return res;
};

export default function VoiceTab() {
  const dispatch = useDispatch();
  let { brandMeta } = getCSUserMeta();
  const { voicesList, isVoicesListFetching } = useSelector(
    (state) => state?.voicesList
  );

  const {
    selectedVoices,
    isVoiceListModalOpen,
    pendingTTSScriptIds,
    getUpdatedData,
    TTSTimelineVoicesMP3,
  } = useSelector((state) => state?.voices);
  let { jsonConfig, messages } = useConfig();

  const FETCH_COMPLETED_TTS_INTERVAL = 3000;

  useEffect(() => {
    if (pendingTTSScriptIds?.length === 0 || !pendingTTSScriptIds) return;
    let intervalId;
    intervalId = setInterval(() => {
      // console.log("loop started !", intervalId);
      getTTSProcessStatusV2({
        scriptIds: pendingTTSScriptIds,
        onSuccess: (response) => {
          if (!Array.isArray(response?.data) || response?.data?.length === 0)
            return;
          let { brandMeta } = getCSUserMeta();
          // console.log("response?.data", response?.data);
          dispatch(
            UPDATE_TTS_PROFANITY_META({
              response: response?.data,
              profanity: brandMeta?.profanity,
            })
          );
        },
        onError: () => {},
      });
    }, FETCH_COMPLETED_TTS_INTERVAL);

    return () => {
      // console.log("loop closed !", intervalId);
      clearInterval(intervalId);
    };
  }, [JSON.stringify(pendingTTSScriptIds)]);

  const handleClickOpen = () => {
    dispatch(
      SET_VOICE_META({
        isVoiceListModalOpen: true,
        voiceListModalAction: "ADD_VOICE",
      })
    );
  };

  const handleCloseVoiceListModal = () => {
    dispatch(SET_VOICE_META({ isVoiceListModalOpen: false }));
  };

  const handleClosePronunciationModal = () => {
    dispatch(SET_VOICE_META({ isDictModalOpen: false }));
  };

  useEffect(() => {
    if (voicesList?.length === 0) {
      if (!isVoicesListFetching) {
        getTTSVoicesDataAPI();
      }
    }
    handleCloseVoiceListModal();
    handleClosePronunciationModal();
    getUpdatedData && dispatch(SET_VOICE_META({ getUpdatedData: false }));
    return () => {
      dispatch(
        SET_VOICE_META({
          isTTSProcessing: false,
          isTTSVoicePlaying: false,
        })
      );
    };
  }, []);

  const getTTSVoicesDataAPI = () => {
    dispatch(
      SET_VOICE_LIST_META({
        isVoicesListFetching: true,
      })
    );
    getTTSVoicesV2({
      onSuccess: async (response) => {
        let responseVoiceJson = response?.data?.voiceData || [];
        var reqiredVoiceDataArr = [];
        if (jsonConfig?.TTS_VOICE_ARTISTS?.length !== 0) {
          reqiredVoiceDataArr = reqiredVoiceData(
            responseVoiceJson,
            jsonConfig?.TTS_VOICE_ARTISTS,
            KEY_REF["artistName"]
          );
        } else if (jsonConfig?.TTS_VOICE_LANGUAGE?.length !== 0) {
          reqiredVoiceDataArr = reqiredVoiceData(
            responseVoiceJson,
            jsonConfig?.TTS_VOICE_LANGUAGE,
            KEY_REF["language"]
          );
        } else {
          reqiredVoiceDataArr = responseVoiceJson;
        }
        let favdata = await getFavVoicesList();
        let popularVoiceListdata = await getPopularVoicesList();
        dispatch(
          SET_VOICE_LIST_META({
            voicesList: reqiredVoiceDataArr,
            isVoicesListFetching: false,
            favVoicesList: favdata,
            popularVoicesList: popularVoiceListdata,
          })
        );
      },
      onError: () => {
        dispatch(
          SET_VOICE_LIST_META({
            isVoicesListFetching: false,
          })
        );
      },
    });
  };

  const { audioCommonRef, playingAudio, setPlayingAudio, playPause } =
    useTTSProcessedVoicePlayPause();

  return (
    <>
      <div
        className="voice_tab_container"
        key={`voice_tab_container_${getUpdatedData}`}
      >
        <div className="TTS_player_audio_container">
          <audio
            id="TTS_player_audio"
            onError={() => {
              showNotification("ERROR", "Something went wrong!");
              setPlayingAudio((prev) => ({
                ...prev,
                isLoading: false,
              }));
            }}
            controlsList="nodownload noplaybackrate"
            ref={audioCommonRef}
            controls
            onLoadedMetadata={() => {
              setPlayingAudio((prev) => ({
                ...prev,
                isLoading: false,
              }));
            }}
            onEnded={() => {
              setPlayingAudio((prev) => ({
                ...prev,
                isPlaying: false,
              }));
            }}
            onPlay={() => {
              dispatch(
                SET_VOICE_META({
                  isTTSVoicePlaying: true,
                })
              );
              setPlayingAudio((prev) => ({
                ...prev,
                isPlaying: true,
              }));
            }}
            onPause={() => {
              dispatch(
                SET_VOICE_META({
                  isTTSVoicePlaying: false,
                })
              );
              setPlayingAudio((prev) => ({
                ...prev,
                isPlaying: false,
              }));
            }}
          />
        </div>
        {selectedVoices !== null && selectedVoices?.length > 0 ? (
          <>
            {selectedVoices?.map((data, index) => {
              let isContentPresent = data?.content?.some((data) =>
                Boolean(data?.content)
              );
              return (
                <React.Fragment key={data?.content?.[0]?.voiceUUID}>
                  <CustomToolTip
                    title={
                      isContentPresent
                        ? "Change voice"
                        : "Add content before changing voice"
                    }
                  >
                    <div
                      className={`selected_voice_container ${
                        isContentPresent ? "content_present" : "no_content"
                      }`}
                      onClick={() => {
                        if (!isContentPresent) return;
                        dispatch(
                          SET_VOICE_META({
                            isVoiceListModalOpen: true,
                            voiceListModalAction: "CHANGE_VOICE",
                            replaceVoiceMeta: {
                              voiceId: data?.voiceId || "",
                              artistName: data?.artistName,
                              ...(brandMeta?.profanity && {
                                langCode: data?.langCode,
                              }),
                              gender: data?.gender,
                              color: data?.color,
                              picture: data?.picture,
                              voiceProvider: data?.voiceProvider,
                              index,
                            },
                          })
                        );
                      }}
                    >
                      <LazyLoadImage
                        className={`selected_voice_img`}
                        style={{
                          border: `2px solid ${
                            data?.color ||
                            (data?.gender === "Male"
                              ? "var(--color-male-voice)"
                              : "var(--color-female-voice)")
                          }`,
                        }}
                        src={data.picture}
                        alt={"picture"}
                        effect="blur"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DefaultUser;
                        }}
                      />
                      <p
                        className="selected_voice_artistname"
                        data-shortname={data?.voiceId}
                        data-vp={data?.voiceProvider}
                      >
                        {data.artistName}
                        {!!data.gender &&
                          ` (${data.gender?.[0]?.toLowerCase()})`}
                      </p>
                    </div>
                  </CustomToolTip>
                  <TextBoxes
                    voice={data}
                    voiceIndex={index}
                    handleClickOpen={handleClickOpen}
                    playingAudio={playingAudio}
                    playPause={playPause}
                  />
                </React.Fragment>
              );
            })}
            <div className="voices_action_btn_bottom_container">
              <AddVoiceMenu />
              <GenerateAllVoiceBtn />
            </div>
            <ProfanityModal />
          </>
        ) : (
          <div className="voice_placeholder">
            <FormattedMessage id="workspace.voiceTab.placeholder" />
          </div>
        )}
      </div>
      <Fragment key={`voice_note_${getUpdatedData}`}>
        {TTSTimelineVoicesMP3?.length === 0 && (
          <div className="voice_note">
            <InfoFilled />
            <br />
            <FormattedMessage
              id="workspace.voiceTab.note"
              values={{
                linkText: messages?.workspace?.voiceTab?.noteLinkText,
                link: () => (
                  <a
                    href={messages?.workspace?.voiceTab?.noteLinkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {messages?.workspace?.voiceTab?.noteLinkText}
                  </a>
                ),
              }}
            />
            <br />
            {messages?.workspace.voiceTab.note1 && (
              <span><FormattedMessage id="workspace.voiceTab.note1"/></span>
            )} 
          </div>
        )}
      </Fragment>
      <DictionaryModal />
      <ModalWrapper
        isOpen={isVoiceListModalOpen}
        onClose={handleCloseVoiceListModal}
        className="voiceListModal"
      >
        <VoiceArtistsModal onClose={handleCloseVoiceListModal} />
      </ModalWrapper>
    </>
  );
}
