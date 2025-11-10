import { useEffect, useState } from "react";
import { StyleSelector } from "../StyleSelector/StyleSelector";
import "./MusicStyleSelector.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../../../customHooks/useConfig";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import randomIntFromInterval from "../../../../utils/randomIntFromInterval";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import { AIMusicActions } from "../../constants/AIMusicActions";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { SET_AI_MUSIC_BRAND_CONFIG_META } from "../../redux/AIMusicbrandConfigsSlice";
import getBrandConfig from "../../services/TuneyAIMusic/getBrandConfig";
import NavStrings from "../../../../routes/constants/NavStrings";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import getGroupByData from "../../../../utils/getGroupByData";
import sendTuneyPostData from "../../services/AIMusicDB/sendTuneyPostData";
import generateAITrack from "../../services/TuneyAIMusic/generateAITrack";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";

export const MusicStyleSelector = ({ uploadVideo, VideoURL }) => {
  const { projectID } = useSelector((state) => state.projectMeta);
  const {
    recentAIGeneratedData,
    freshAITracksVariantsList,
    SSflaxTrackID,
    aiMusicGeneratorAnalysisDetails,
  } = useSelector((state) => state.AIMusic);
  const { AIMusicConfigByBrand } = useSelector((state) => state.brandConfigs);
  const { brandMeta } = getCSUserMeta();
  const [genre, setGenre] = useState([]);
  const [mood, setMood] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [brandTags, setBrandTags] = useState(null);
  const [activeMood, setActiveMood] = useState([]);
  const [activeGenre, setActiveGenre] = useState([]);
  const [selectedTempo, setSelectedTempo] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [tempoOptions, setTempoOptions] = useState([
    { label: "fast" },
    { label: "slow" },
    { label: "random" },
  ]);
  const VARIATION_COUNT = 5;
  const { config, jsonConfig } = useConfig();
  const { uploadedVideoBlobURL } = useSelector((state) => state.video);

  const handleCancel = () => {
    // navigate(-1);
    navigate(NavStrings?.WORKSPACE_AI_MUSIC_GENERATOR);
  };

  const storeTracksAndUpdateState = async (newVariants) => {
    if (!newVariants) return;
    let newVariantsArr = [...(newVariants || [])];
    let AIMusicMeta;
    if (newVariantsArr?.length !== 0) {
      let AITrackMetaGeneration = newVariantsArr?.map((data) => ({
        mood: data?.settings?.mood,
        genre: data?.settings?.genre,
        tempo: data?.settings?.tempo,
      }));
      let AITrackNameAndDescription = await getVariantsTrackNamesAndDescription(
        AITrackMetaGeneration,
        config?.modules?.TRACK_NAME_DESCRIPTION_BY_OPEN_AI,
        getLastVariantCount(recentAIGeneratedData)
      );
      AIMusicMeta = newVariantsArr?.map((data, index) => {
        newVariantsArr[index].label =
          AITrackNameAndDescription?.[index]?.name || `${data?.name}`;
        newVariantsArr[index].desc =
          AITrackNameAndDescription?.[index]?.description || "-";
        return {
          label: AITrackNameAndDescription?.[index]?.name || `${data?.name}`,
          value: data?.cue_id,
          desc: AITrackNameAndDescription?.[index]?.description || "-",
          parentCueId: data?.parent_cue_id,
          action: AIMusicActions.VARIANT,
        };
      });
    }
    let filteredVariantsObj = newVariantsArr.map((variant) => {
      const {
        bpm = "",
        key = "",
        image_url = "",
        peaks = [],
        ...restData
      } = variant;
      return { ...restData, type: "tunney" };
    });
    console.log("filteredVariantsObj", filteredVariantsObj);
    dispatch(
      SET_AI_MUSIC_META({
        freshAITracksVariantsList: [
          ...filteredVariantsObj,
          ...(freshAITracksVariantsList ?? []),
        ],
      })
    );
    let AIMusicTrackDetails = filteredVariantsObj?.map((trackMeta) => ({
      mood: trackMeta?.settings?.mood,
      genre: trackMeta?.settings?.genre,
      tempo: trackMeta?.settings?.tempo,
      length: trackMeta?.settings?.length,
      name: trackMeta?.label,
      description: trackMeta?.desc,
      cue_id: trackMeta?.cue_id,
      parent_cue_id: trackMeta?.parent_cue_id,
      sonic_logo_id: trackMeta?.custom_stems?.cue_logo?.[0]?.effect_id || null,
      flax_id:
        (trackMeta?.sections?.[0]?.flax_tracks?.[0] === "None"
          ? ""
          : trackMeta?.sections?.[0]?.flax_tracks?.[0] || "") || SSflaxTrackID,
      action: AIMusicActions.VARIANT,
      project_id: projectID,
    }));

    const TAGS_MEDIA_TYPE = 10;
    sendTuneyPostData({
      requestObj: {
        mood: selectedMood,
        genre: selectedGenre,
        tempo: selectedTempo,
        mediatype: TAGS_MEDIA_TYPE,
        processed: true,
        status: "completed",
        projectID: projectID,
      },
      onSuccess: (res) => {
        console.log("sendTuneyPostData success", res?.data);

        // Find index based on mediatype
        const index = aiMusicGeneratorAnalysisDetails.findIndex(
          (item) => TAGS_MEDIA_TYPE === Number(item?.mediatype)
        );

        const newAiMusicGeneratorAnalysisDetails = [
          ...aiMusicGeneratorAnalysisDetails,
        ];

        const updatedData = {
          id: res?.data,
          mood: selectedMood,
          genre: selectedGenre,
          tempo: selectedTempo,
          mediatype: TAGS_MEDIA_TYPE,
          status: "completed",
          isTuneyTrackGenerated: true,
        };
        console.log("index", index);
        // If found, replace the object
        if (index !== -1) {
          newAiMusicGeneratorAnalysisDetails[index] = updatedData;
        } else {
          // Else, add the object
          newAiMusicGeneratorAnalysisDetails.push(updatedData);
        }
        console.log("updatedData", updatedData);
        console.log(
          "newAiMusicGeneratorAnalysisDetails",
          newAiMusicGeneratorAnalysisDetails
        );

        // const AIMusic
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorAnalysisDetails: newAiMusicGeneratorAnalysisDetails,
          })
        );
      },
      onError: () => dispatch(RESET_LOADING_STATUS()),
    });
    addAIMusicResponse({
      responseMeta: AIMusicTrackDetails,
      onSuccess: () => {
        updateAIMusicMeta({
          projectID,
          AIMusicMeta: {
            variantCueIds: JSON.stringify(AIMusicMeta),
          },
          recentAIGeneratedData,
          onSuccess: () => {
            dispatch(RESET_LOADING_STATUS());
            navigate(getWorkSpacePath(projectID, null));
          },
        });
      },
      onError: () => dispatch(RESET_LOADING_STATUS()),
    });
  };

  const GetTaskID = async (selectedGenre, selectedMood, selectedTempo) => {
    dispatch(
      SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
    );
    try {
      const bodies = new Array(VARIATION_COUNT).fill(0)?.map(() => ({
        length: +jsonConfig?.CACHED_AI_MUSIC_LENGTH || 90,
        brand_tag_code: brandMeta?.tuneyBrandName,
        build: "none",
        mood: selectedMood,
        genre: selectedGenre,
        tempo: getTempoValue(selectedTempo),
        flex_tracks: ["None"],
      }));
      const promises = bodies.map((body) => generateAITrack(body));
      const trackMeta = await Promise.all(promises);
      console.log("trackMeta generateAITrack::", trackMeta);
      storeTracksAndUpdateState(trackMeta);
    } catch (error) {
      console.log("error", error);
      dispatch(RESET_LOADING_STATUS());
    }
  };

  const getTempoValue = (selectedTempo) => {
    if (selectedTempo !== "random") {
      return selectedTempo;
    }
    let randomIndex = randomIntFromInterval(0, tempoOptions?.length - 2);
    let randomTempo = tempoOptions[randomIndex];
    return randomTempo?.label || "slow";
  };

  useEffect(() => {
    selectedTempo && setSelectedTempo(null);
    if (!selectedGenre || !selectedMood) {
      return;
    }
    let filteredData =
      brandTags
        ?.filter(
          (data) => data?.genre === selectedGenre && data?.mood === selectedMood
        )
        ?.map((data) => data.tempo) || [];
    let uniqueTempo = [...new Set(filteredData)];
    if (uniqueTempo.length <= 1) {
      setTempoOptions(
        uniqueTempo?.map((tempo) => ({
          label: tempo,
        }))
      );
    } else {
      setTempoOptions(
        [...uniqueTempo, "random"]?.map((tempo) => ({
          label: tempo,
        }))
      );
    }
  }, [selectedMood, selectedGenre]);

  useEffect(() => {
    if (AIMusicConfigByBrand && AIMusicConfigByBrand?.length > 0) {
      setBrandTags(AIMusicConfigByBrand);
      loadMoodAndGenre(AIMusicConfigByBrand);
    } else {
      getBrandConfigData(brandMeta?.tuneyBrandName);
    }
  }, []);

  const onGetBrandConfigSuccess = (response) => {
    if (!response.data || response.data?.length === 0) {
      showNotification(
        "ERROR",
        "Mood and Genre data not available for this brand!"
      );
      navigate(`${NavStrings.PROJECTS}`);
      return;
    }
    let brandTagsArr = response.data || [];
    setBrandTags(brandTagsArr);
    dispatch(
      SET_AI_MUSIC_BRAND_CONFIG_META({
        AIMusicConfigByBrand: brandTagsArr,
      })
    );
    loadMoodAndGenre(brandTagsArr);
  };

  const loadMoodAndGenre = (MoodAndGenreData) => {
    let filteredGenre = MoodAndGenreData?.map((data, i) => data.genre);
    let uniqueGenre = [...new Set(filteredGenre)];
    let genreArr = uniqueGenre.map((data, i) => ({
      label: data,
    }));
    let filteredMood = MoodAndGenreData?.map((data, i) => data.mood);
    let uniqueMood = [...new Set(filteredMood)];
    let MoodArr = uniqueMood.map((data, i) => ({
      label: data,
    }));
    setGenre(genreArr);
    setMood(MoodArr);
    setLoadingConfig(false);
  };

  const getBrandConfigData = (brand) => {
    setLoadingConfig(true);
    getBrandConfig({
      brand,
      onSuccess: onGetBrandConfigSuccess,
      onError: () => {
        setLoadingConfig(false);
      },
    });
  };

  if (loadingConfig || genre?.length === 0 || mood?.length === 0) {
    return <CustomLoader />;
  }

  return (
    <div className="style_selection_container">
      <h3 className="style_selection_title">Style Selection</h3>
      <StyleSelector
        title="Genre"
        tagType="GENRE"
        options={genre}
        activeOptions={activeGenre}
        selectedOption={selectedGenre}
        onSelect={(data) => {
          if (selectedGenre === data.label) {
            setSelectedGenre("");
            setActiveMood([]);
          } else {
            setSelectedGenre(data.label);
            let moodForselectedGenre = [
              ...new Set(
                getGroupByData(brandTags, "genre")?.[data.label]?.map(
                  (data) => data.mood
                )
              ),
            ];
            setActiveMood(moodForselectedGenre);
          }
        }}
      />

      <StyleSelector
        title="Mood"
        tagType="MOOD"
        options={mood}
        activeOptions={activeMood}
        selectedOption={selectedMood}
        onSelect={(data) => {
          if (selectedMood === data.label) {
            setSelectedMood("");
            setActiveGenre([]);
          } else {
            setSelectedMood(data.label);
            let genreForselectedMood = [
              ...new Set(
                getGroupByData(brandTags, "mood")?.[data.label]?.map(
                  (data) => data.genre
                )
              ),
            ];
            setActiveGenre(genreForselectedMood);
          }
        }}
      />

      <StyleSelector
        title="Tempo"
        tagType="TEMPO"
        options={tempoOptions}
        selectedOption={selectedTempo}
        onSelect={(data) => {
          if (selectedTempo === data?.label) {
            setSelectedTempo(null);
          } else {
            setSelectedTempo(data?.label);
          }
        }}
      />

      <div className="MusicStyleSelector_btn_container">
        <ButtonWrapper variant="outlined" onClick={handleCancel}>
          Cancel
        </ButtonWrapper>
        <ButtonWrapper
          variant="filled"
          disabled={!(!!selectedGenre && !!selectedMood && !!selectedTempo)}
          onClick={() => {
            dispatch(
              SET_AI_MUSIC_META({
                selectedAIMusicConfig: {
                  genre: selectedGenre,
                  mood: selectedMood,
                  tempo: getTempoValue(selectedTempo),
                },
              })
            );

            if (VideoURL || uploadedVideoBlobURL) {
              uploadVideo();
            }

            GetTaskID(selectedGenre, selectedMood, selectedTempo);
          }}
        >
          Generate
        </ButtonWrapper>
      </div>
    </div>
  );
};
