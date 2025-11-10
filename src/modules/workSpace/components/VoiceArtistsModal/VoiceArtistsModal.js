import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import "./VoiceArtistsModal.css";
import VoiceArtistCard from "../VoiceArtistCard/VoiceArtistCard";
import VoicesFilterOption from "../VoicesFilterOption/VoicesFilterOption";
import { useSelector, useDispatch } from "react-redux";
import {
  ADD_NEW_TTS_SCRIPT_IDS,
  // ADD_RECENT_VOICE,
  ADD_VOICE,
  selectFilteredDisabledVoiceList,
  SET_VOICE_META,
} from "../../redux/voicesSlice";
import { SET_VOICE_LIST_META } from "../../redux/voicesListSlice";
import { useConfig } from "../../../../customHooks/useConfig";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import ReplaceVoiceModal from "../../../projects/components/ReplaceVoiceModal/ReplaceVoiceModal";
import { v4 as uuidv4 } from "uuid";
import showNotification from "../../../../common/helperFunctions/showNotification";
import getFavVoicesList from "../../services/voiceDB/getFavVoicesList";
import useTTSSampleVoicePlayPause from "../../../../customHooks/useTTSSampleVoicePlayPause";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import getTTSVoicesV2 from "../../services/voiceExternal/getTTSVoicesV2";
import { KEY_REF } from "../../constants/getTTSRefKeys";
import { TTS_STATUS } from "../../constants/TTSStatus";
import processTTSV2 from "../../services/voiceExternal/processTTSV2";
import { ElevenLabsVoiceProvider } from "../../constants/VoiceProviders";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { PROFANITY_STATUS } from "../../constants/profanityStatus";
import getPopularVoicesList from "../../services/voiceDB/getPopularVoicesList";
import { sortBy, find } from "lodash";
import { TTSVoiceTypes } from "../../constants/TTSVoiceTypes";
import getRecentlyUsedVoicesList from "../../services/voiceDB/getRecentlyUsedVoicesList";
import removeBreakTags from "../../../../utils/removeBreakTags";
import { ReactComponent as Google } from '../../../../static/common/Google.svg'
import { ReactComponent as Azure } from '../../../../static/common/Azure.svg'
import { ReactComponent as ElevenLabs } from '../../../../static/common/ElevenLabs.svg'

const toLower = (str) => str?.trim()?.toLowerCase();
const matches = (voice, list, key) =>
  list?.length > 0
    ? list.some(
      (option) => toLower(option?.value) === toLower(voice[KEY_REF[key]])
    )
    : true;

const matchesArray = (voice, list, key) =>
  list?.length > 0
    ? voice[KEY_REF[key]]?.some((item) =>
      list.map((opt) => opt.value).includes(item)
    )
    : true;

const VoiceModal = ({ onClose }) => {
  const [voiceData, setvoiceData] = useState([]);
  const [filteredVoiceData, setFilteredVoiceData] = useState([]);
  const [voiceListLoading, setvoiceListLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState({
    language: [],
    accent: [],
    tag: [],
    industry: [],
    gender: [],
    age: [],
    artistName: "",
    voiceOptionList: [],
    isStudioQuality: false,
    isMultiExpressive: false,
    isProfessional: false,
  });

  const [clickedVoiceData, setClickedVoiceData] = useState({});
  const [projectName, setProjectName] = useState("");
  const [isReplaceVoiceActionModalOpen, setIsReplaceVoiceActionModalOpen] =
    useState(false);
  let { config, jsonConfig } = useConfig();
  const {
    selectedVoices,
    // recentlyAddedVoice,
    voiceListModalAction,
    replaceVoiceMeta,
    getUpdatedData,
  } = useSelector((state) => state?.voices);
  const { voicesList, isVoicesListFetching, favVoicesList, popularVoicesList } =
    useSelector((state) => state?.voicesList);
  const filteredDisabledVoiceList = useSelector(
    selectFilteredDisabledVoiceList
  );
  console.log("filteredDisabledVoiceList", filteredDisabledVoiceList);
  const { projectName: projectNameState, projectID } = useSelector(
    (state) => state.projectMeta
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (voiceData?.length == 0) return;
    getTTSVoicesData({});
  }, [voiceData?.length]);

  useEffect(() => {
    if (voicesList?.length > 0) {
      setvoiceListLoading(false);
      setvoiceData(voicesList);
      setFilteredVoiceData(voicesList);
      getTTSVoicesData({});
    } else {
      if (!isVoicesListFetching) {
        getTTSVoicesDataAPI();
      }
    }
    return () => {
      replaceVoiceMeta && dispatch(SET_VOICE_META({ replaceVoiceMeta: null }));
    };
  }, [isVoicesListFetching]);

  useEffect(() => {
    setProjectName(projectNameState);
  }, [projectNameState]);

  const setFilteredItemsData = (
    language,
    accent,
    tag,
    industry,
    gender,
    age,
    artistName,
    voiceOptionList,
    isStudioQuality = false,
    isMultiExpressive = false,
    isProfessional = false
  ) => {
    setFilteredItems({
      language,
      accent,
      tag,
      industry,
      gender,
      age,
      artistName,
      voiceOptionList,
      isStudioQuality,
      isMultiExpressive,
      isProfessional,
    });
  };

  const reqiredVoiceData = (arr1, arr2, filterBy) => {
    let res = [];
    res = arr1?.filter((el) => {
      return arr2?.find((element) => {
        return element === el[filterBy];
      });
    });
    return res;
  };

  const getTTSVoicesDataAPI = () => {
    setvoiceListLoading(true);
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
        setvoiceListLoading(false);
        setvoiceData(reqiredVoiceDataArr);
        setFilteredVoiceData(reqiredVoiceDataArr);
      },
      onError: () => {
        dispatch(
          SET_VOICE_LIST_META({
            isVoicesListFetching: false,
          })
        );
        setvoiceListLoading(false);
        setvoiceData([]);
        setFilteredVoiceData([]);
      },
    });
  };

  const getTTSVoicesData = async ({
    language = [],
    accent = [],
    tag = [],
    industry = [],
    gender = [],
    age = [],
    artistName = "",
    voiceOptionList = [],
    isStudioQuality = false,
    isMultiExpressive = false,
    isProfessional = false,
    favVoices = favVoicesList,
  }) => {
    setvoiceListLoading(true);
    setFilteredItemsData(
      language,
      accent,
      tag,
      industry,
      gender,
      age,
      artistName,
      voiceOptionList,
      isStudioQuality,
      isMultiExpressive,
      isProfessional
    );
    let responseVoiceJson = voicesList;
    let selectedVoiceTypeArray = [
      isStudioQuality ? TTSVoiceTypes.STUDIO_QUALITY : "",
      isMultiExpressive ? TTSVoiceTypes.MULTI_EXPRESSIVE : "",
      isProfessional ? TTSVoiceTypes.PROFESSIONAL : "",
    ]?.filter(Boolean);
    var voiceJson = [];
    var filteredData = [];
    var favArtist = favVoices;
    let selectedVoiceArr = selectedVoices?.map((voice) => voice.voiceId) || [];
    if (["All", undefined].includes(voiceOptionList?.[0]?.value)) {
      var selectedVoiceJson = responseVoiceJson?.filter((voice) =>
        selectedVoiceArr?.includes(voice[KEY_REF["voiceId"]])
      );
      let sortedSelectedVoiceJson = sortBy(
        selectedVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );
      let likedVoiceJson = responseVoiceJson?.filter((voice) =>
        favArtist?.includes(voice[KEY_REF["voiceId"]])
      );
      let sortedLikedVoiceJson = sortBy(
        likedVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );

      let topVoiceJson = [...sortedSelectedVoiceJson, ...sortedLikedVoiceJson];
      topVoiceJson = topVoiceJson?.filter(
        (arr, index, self) =>
          index ===
          self?.findIndex(
            (t) => t[KEY_REF["voiceId"]] === arr[KEY_REF["voiceId"]]
          )
      );

      var remainingVoiceJson = responseVoiceJson?.filter(
        (voice) =>
          ![...new Set([...selectedVoiceArr, ...favArtist])].includes(
            voice[KEY_REF["voiceId"]]
          )
      );
      let sortedRemainingVoiceJson = sortBy(
        remainingVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );
      filteredData = [...topVoiceJson, ...sortedRemainingVoiceJson];
    }
    if (voiceOptionList?.[0]?.value === "OnBrand") {
      var onBrandVoiceJson = responseVoiceJson?.filter(
        (voice) => voice[KEY_REF["isOnBrand"]] === 1
      );
      let sortedOnBrandVoiceJsonVoiceJson = sortBy(
        onBrandVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );
      filteredData = sortedOnBrandVoiceJsonVoiceJson;
    }
    if (voiceOptionList?.[0]?.value === "Recent") {
      try {
        let recentlyAddedVoiceArr = await getRecentlyUsedVoicesList();
        let recentlyAddedVoiceJson = recentlyAddedVoiceArr
          .map((shortName) => {
            return find(responseVoiceJson, { [KEY_REF["voiceId"]]: shortName });
          })
          .filter(Boolean);
        filteredData = recentlyAddedVoiceJson;
      } catch (error) {
        console.log("error", error);
        filteredData = [];
      }
    }
    if (voiceOptionList?.[0]?.value === "Saved") {
      let likedVoiceJson = responseVoiceJson?.filter((voice) =>
        favArtist.includes(voice[KEY_REF["voiceId"]])
      );
      let sortedLikedVoiceJson = sortBy(
        likedVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );
      filteredData = sortedLikedVoiceJson;
    }
    if (voiceOptionList?.[0]?.value === "Popular") {
      let popularVoiceJson = responseVoiceJson?.filter((voice) =>
        popularVoicesList.includes(voice[KEY_REF["voiceId"]])
      );
      let sortedPopularVoiceJson = sortBy(
        popularVoiceJson,
        (o) => o[KEY_REF["artistName"]]
      );
      filteredData = sortedPopularVoiceJson;
    }

    var filteredVoiceData =
      filteredData?.filter((voice) => {
        return (
          matches(voice, language, "language") &&
          matches(voice, accent, "accent") &&
          matches(voice, gender, "gender") &&
          matches(voice, age, "age") &&
          matchesArray(voice, tag, "tags") &&
          matchesArray(voice, industry, "speakingStyles") &&
          toLower(voice[KEY_REF["artistName"]])?.includes(
            toLower(artistName)
          ) &&
          (selectedVoiceTypeArray?.length === 0
            ? true
            : selectedVoiceTypeArray?.includes(voice[KEY_REF["voiceType"]])) &&
          !filteredDisabledVoiceList?.includes(voice[KEY_REF["voiceId"]])
        );
      }) || [];
    voiceJson = filteredVoiceData;
    setFilteredVoiceData([...voiceJson]);
    setvoiceListLoading(false);
  };

  const replaceVoiceTTSProcess = (arrayToProcessTTS, newSelectedVoices) => {
    processTTSV2({
      projectID,
      jobRequest: arrayToProcessTTS,
      onSuccess: (res) => {
        let ttsScriptIds = res.data?.map((data) => data?.scriptId);
        dispatch(ADD_NEW_TTS_SCRIPT_IDS(ttsScriptIds));
        dispatch(
          SET_VOICE_META({
            selectedVoices: newSelectedVoices,
            getUpdatedData: !getUpdatedData,
          })
        );
      },
      onError: () => { },
    });
  };

  const changeSelectedVoiceOnly = () => {
    let { brandMeta } = getCSUserMeta();
    const { langCode, voiceProvider, ...clickedVoiceDataRest } =
      clickedVoiceData;
    let newSelectedVoices = selectedVoices?.map((data, index) => {
      if (
        data.voiceId === replaceVoiceMeta.voiceId &&
        index === replaceVoiceMeta.index
      ) {
        onClose();
        return {
          ...data,
          ...clickedVoiceDataRest,
          content: data?.content?.map((contentMeta) => ({
            content: removeBreakTags(contentMeta.content),
            index: contentMeta.index,
            voiceUUID: contentMeta.voiceUUID,
            voiceIndex: contentMeta.voiceIndex,
            speakingStyle: contentMeta.speakingStyle,
            ...(voiceProvider !== ElevenLabsVoiceProvider
              ? {
                speed: contentMeta.speed || "1",
                pitch: contentMeta.pitch || "1",
              }
              : {
                stability: contentMeta.stability || "0.5",
                similarityBoost: contentMeta.similarityBoost || "0.7",
                style: contentMeta.style || "0",
                useSpeakerBoost: contentMeta.useSpeakerBoost ?? true,
              }),
            voice: clickedVoiceDataRest.voiceId,
            gender: clickedVoiceDataRest.gender,
            color: clickedVoiceDataRest.color,
            voiceProvider,
            mp3: "",
            artistName: clickedVoiceDataRest?.artistName,
            duration: 0,
            status: !!contentMeta?.content
              ? TTS_STATUS.STARTED
              : TTS_STATUS.NOT_STARTED,
            statusMessage: "",
            ...(brandMeta?.profanity && {
              expletiveWordCount: null,
              ampProfanity: null,
              expletiveWords: null,
              profanityStatus: !!contentMeta?.content
                ? PROFANITY_STATUS.STARTED
                : PROFANITY_STATUS.NOT_STARTED,
              langCode,
            }),
          })),
        };
      } else {
        return data;
      }
    });

    let arrayToProcessTTS = newSelectedVoices
      ?.filter(
        (data, index) =>
          index === replaceVoiceMeta.index &&
          data.voiceId === clickedVoiceDataRest.voiceId
      )
      ?.flatMap((data) => data.content);
    replaceVoiceTTSProcess(arrayToProcessTTS, newSelectedVoices);
  };

  const changeAllOccurrencesOfSelectedVoice = () => {
    let { brandMeta } = getCSUserMeta();
    const { langCode, voiceProvider, ...clickedVoiceDataRest } =
      clickedVoiceData;
    let newSelectedVoices = selectedVoices?.map((data) => {
      if (data.voiceId === replaceVoiceMeta.voiceId) {
        onClose();
        return {
          ...data,
          ...clickedVoiceDataRest,
          content: data?.content?.map((contentMeta) => ({
            // ...contentMeta,
            content: removeBreakTags(contentMeta.content),
            index: contentMeta.index,
            voiceIndex: contentMeta.voiceIndex,
            voiceUUID: contentMeta.voiceUUID,
            speakingStyle: contentMeta.speakingStyle,
            ...(voiceProvider !== ElevenLabsVoiceProvider
              ? {
                speed: contentMeta.speed || "1",
                pitch: contentMeta.pitch || "1",
              }
              : {
                stability: contentMeta.stability || "0.5",
                similarityBoost: contentMeta.similarityBoost || "0.7",
                style: contentMeta.style || "0",
                useSpeakerBoost: contentMeta.useSpeakerBoost ?? true,
              }),
            voice: clickedVoiceDataRest.voiceId,
            color: clickedVoiceDataRest.color,
            gender: clickedVoiceDataRest.gender,
            voiceProvider,
            mp3: "",
            artistName: clickedVoiceDataRest?.artistName,
            duration: 0,
            status: !!contentMeta?.content
              ? TTS_STATUS.STARTED
              : TTS_STATUS.NOT_STARTED,
            statusMessage: "",
            ...(brandMeta?.profanity && {
              expletiveWordCount: null,
              ampProfanity: null,
              expletiveWords: null,
              profanityStatus: !!contentMeta?.content
                ? PROFANITY_STATUS.STARTED
                : PROFANITY_STATUS.NOT_STARTED,
              langCode,
            }),
          })),
        };
      } else {
        return data;
      }
    });
    // dispatch(SET_VOICE_META({ selectedVoices: newSelectedVoices }));
    let arrayToProcessTTS = newSelectedVoices
      ?.filter((data) => data.voiceId === clickedVoiceDataRest.voiceId)
      ?.flatMap((data) => data.content);
    replaceVoiceTTSProcess(arrayToProcessTTS, newSelectedVoices);
  };

  const { audioCommonRef, playingAudio, setPlayingAudio, playPause } =
    useTTSSampleVoicePlayPause();

  return (
    <div key={`voices-${voicesList?.length}-${isVoicesListFetching}`}>
      <div className="voicePage__container">
        <div className="voice_artist_audio_container">
          <audio
            id="voice_artist_audio"
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
            }}
            onPause={() => {
              dispatch(
                SET_VOICE_META({
                  isTTSVoicePlaying: false,
                })
              );
            }}
          />
        </div>
        <p className="voice_list_header boldFamily highlight_text">
          Select Voice
        </p>
        <p className="voice_list_sub_header">
          Choose the best suited voice for your project
        </p>

        <VoicesFilterOption
          voiceData={voiceData}
          filteredData={filteredVoiceData}
          setFilteredVoiceData={setFilteredVoiceData}
          filteredItems={filteredItems}
          setFilteredItemsData={setFilteredItemsData}
          getTTSVoicesData={getTTSVoicesData}
        />

        <div className="voice_outer_container">
          <div className="voice_inner_container">
            {voiceListLoading || isVoicesListFetching ? (
              <div className="spinnerWrapper">
                <CustomLoaderSpinner />
              </div>
            ) : filteredVoiceData?.length === 0 ? (
              <p className="messageContent">No Results Found</p>
            ) : (
              <div className="voice_artists_container">
                {filteredVoiceData?.map((voice, i) => {
                  return (
                    <LazyLoadComponent
                      ref={React.createRef()}
                      defaultHeight={100}
                      key={"VoiceCardGrid_" + voice.title + i}
                    >
                      <div className="lload">
                        <VoiceArtistCard
                          clickedVoiceData={clickedVoiceData}
                          setClickedVoiceData={setClickedVoiceData}
                          key={voice.title + i}
                          likedArtist={favVoicesList}
                          voice={voice}
                          getTTSVoicesData={getTTSVoicesData}
                          isShowFavourites={config?.modules?.showFavourites}
                          filteredItems={filteredItems}
                          onClose={onClose}
                          playingAudio={playingAudio}
                          playPause={playPause}
                        />
                      </div>
                    </LazyLoadComponent>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="button_container">
          <div className="voice_artist_powerd_by">
            <span>
              Powered By
            </span>
            <div className="voice_artist_icons">
              <Azure />
              <Google />
              <ElevenLabs />
            </div>
          </div>
          <div className="voice_artist_btn">
            <ButtonWrapper onClick={() => onClose()}>Cancel</ButtonWrapper>
            <ButtonWrapper
              variant="filled"
              disabled={clickedVoiceData.voiceId && projectName ? false : true}
              onClick={() => {
                let { brandMeta } = getCSUserMeta();
                const { langCode, voiceProvider, ...clickedVoiceDataRest } =
                  clickedVoiceData;
                if (voiceListModalAction === "ADD_VOICE") {
                  dispatch(
                    ADD_VOICE({
                      ...clickedVoiceDataRest,
                      content: [
                        {
                          content: "",
                          voice: clickedVoiceDataRest.voiceId,
                          color: clickedVoiceDataRest.color,
                          gender: clickedVoiceDataRest.gender,
                          voiceProvider,
                          mp3: "",
                          artistName: clickedVoiceDataRest?.artistName,
                          voiceUUID: uuidv4(),
                          speakingStyle:
                            clickedVoiceDataRest?.speakingStyle || "general",
                          ...(voiceProvider !== ElevenLabsVoiceProvider
                            ? { speed: "1", pitch: "1" }
                            : {
                              stability: "0.5",
                              similarityBoost: "0.7",
                              style: "0",
                              useSpeakerBoost: true,
                            }),
                          index: 0,
                          voiceIndex: selectedVoices?.length || 0,
                          status: TTS_STATUS.NOT_STARTED,
                          statusMessage: "",
                          ...(brandMeta?.profanity && {
                            expletiveWordCount: null,
                            ampProfanity: null,
                            expletiveWords: null,
                            profanityStatus: PROFANITY_STATUS.NOT_STARTED,
                            langCode,
                          }),
                        },
                      ],
                    })
                  );
                  // dispatch(ADD_RECENT_VOICE(clickedVoiceDataRest));
                  onClose();
                } else {
                  if (clickedVoiceDataRest.voiceId === replaceVoiceMeta.voiceId) {
                    showNotification(
                      "WARNING",
                      "Same voice selected. Try another one..."
                    );
                    return;
                  }
                  let voicesToReplace = selectedVoices?.filter(
                    (data) => data.voiceId === replaceVoiceMeta.voiceId
                  );
                  if (voicesToReplace.length > 1) {
                    setIsReplaceVoiceActionModalOpen(true);
                  } else {
                    changeSelectedVoiceOnly();
                    onClose();
                  }
                }
              }}
            >
              {voiceListModalAction === "ADD_VOICE" ? "Create" : "Change"}
            </ButtonWrapper>
          </div>
        </div>
      </div>
      <ReplaceVoiceModal
        isOpen={isReplaceVoiceActionModalOpen}
        onClose={() => setIsReplaceVoiceActionModalOpen(false)}
        newSelectedVoice={clickedVoiceData}
        changeAllOccurrencesOfSelectedVoice={
          changeAllOccurrencesOfSelectedVoice
        }
        changeSelectedVoiceOnly={changeSelectedVoiceOnly}
      />
    </div>
  );
};

export default VoiceModal;
