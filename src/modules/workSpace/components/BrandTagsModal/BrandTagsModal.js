import React, { useEffect, useState } from "react";
import "./BrandTagsModal.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import generateTrack from "../../services/TuneyAIMusic/generateTrack";
import getBrandConfig from "../../services/TuneyAIMusic/getBrandConfig";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import getFlaxTrackConfig from "../../services/TuneyAIMusic/getFlaxTrackConfig";
import getGroupByData from "../../../../utils/getGroupByData";
import {
  getGenreTagMeta,
  getMoodTagMeta,
} from "../../helperFunctions/getBrandTagMeta";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import generateTrackVariations from "../../services/TuneyAIMusic/generateTrackVariations";
import generateVariantCues from "../../services/TuneyAIMusic/generateVariantCues";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import NavStrings from "../../../../routes/constants/NavStrings";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { SET_AI_MUSIC_BRAND_CONFIG_META } from "../../redux/AIMusicbrandConfigsSlice";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import randomIntFromInterval from "../../../../utils/randomIntFromInterval";
import { useConfig } from "../../../../customHooks/useConfig";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import { AIMusicActions } from "../../constants/AIMusicActions";

const BrandTagsModal = ({
  type,
  setVariantsDetails,
  closeModal,
  tagsToShow = "BRAND_TAGS",
  hideCancelBtn = false,
  setLoading,
}) => {
  const { projectID } = useSelector((state) => state.projectMeta);
  const {
    recentAIGeneratedData,
    freshAITracksVariantsList,
    selectedAIMusicDetails,
    SSflaxTrackID,
    flaxTrackID,
  } = useSelector((state) => state.AIMusic);
  const { AIMusicConfigByBrand } = useSelector((state) => state.brandConfigs);
  const { brandMeta } = getCSUserMeta();
  const [genre, setGenre] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [mood, setMood] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTempo, setSelectedTempo] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [brandTags, setBrandTags] = useState([]);
  const [activeMood, setActiveMood] = useState([]);
  const [activeGenre, setActiveGenre] = useState([]);
  const [newVariants, setNewVariants] = useState(null);
  const VARIATION_COUNT = 5;
  const [variantList, setvariantList] = useState([]);
  const [tempoOptions, setTempoOptions] = useState(["fast", "slow", "random"]);
  const { config, jsonConfig } = useConfig();

  const getTempoValue = (selectedTempo) => {
    if (selectedTempo !== "random") {
      return selectedTempo;
    }
    let randomIndex = randomIntFromInterval(0, tempoOptions?.length - 2);
    let randomTempo = tempoOptions[randomIndex];
    return randomTempo;
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
      setTempoOptions(uniqueTempo);
    } else {
      setTempoOptions([...uniqueTempo, "random"]);
    }
  }, [selectedMood, selectedGenre]);

  const getFlaxTracksConfigData = (flaxTrackID) => {
    setLoading(true);
    getFlaxTrackConfig({
      flaxTrackID,
      onSuccess: onGetBrandConfigSuccess,
      onError: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    // setTimeout(() => {
    if (tagsToShow === "BRAND_TAGS") {
      if (AIMusicConfigByBrand && AIMusicConfigByBrand?.length > 0) {
        setBrandTags(AIMusicConfigByBrand);
        loadMoodAndGenre(AIMusicConfigByBrand);
      } else {
        getBrandConfigData(brandMeta?.tuneyBrandName);
      }
    } else {
      getFlaxTracksConfigData(flaxTrackID);
    }
    // }, 500);
  }, [tagsToShow]);

  useEffect(() => {
    // console.log("newVariants", newVariants);
    (async () => {
      if (!newVariants) return;
      let newVariantsArr = [...(newVariants || [])];
      let AIMusicMeta;
      if (newVariantsArr?.length !== 0) {
        let AITrackMetaGeneration = newVariantsArr?.map((data) => ({
          mood: data?.settings?.mood,
          genre: data?.settings?.genre,
          tempo: data?.settings?.tempo,
        }));
        let AITrackNameAndDescription =
          await getVariantsTrackNamesAndDescription(
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
        return restData;
      });
      if (type === "FRESH_TRACKS") {
        dispatch(
          SET_AI_MUSIC_META({
            freshAITracksVariantsList: [
              ...filteredVariantsObj,
              ...(freshAITracksVariantsList ?? []),
            ],
          })
        );
      } else if (type === "LOAD_MORE") {
        setVariantsDetails?.((prev) => [
          ...filteredVariantsObj,
          ...(prev ?? []),
        ]);
      }
      setLoading(false);
      setNewVariants(null);
      setvariantList([]);
      let AIMusicTrackDetails = filteredVariantsObj?.map((trackMeta) => ({
        mood: trackMeta?.settings?.mood,
        genre: trackMeta?.settings?.genre,
        tempo: trackMeta?.settings?.tempo,
        length: trackMeta?.settings?.length,
        name: trackMeta?.label,
        description: trackMeta?.desc,
        cue_id: trackMeta?.cue_id,
        parent_cue_id: trackMeta?.parent_cue_id,
        sonic_logo_id:
          trackMeta?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id:
          (trackMeta?.sections?.[0]?.flax_tracks?.[0] === "None"
            ? ""
            : trackMeta?.sections?.[0]?.flax_tracks?.[0] || "") ||
          SSflaxTrackID,
        action: AIMusicActions.VARIANT,
        project_id: projectID,
      }));
      addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
      updateAIMusicMeta({
        projectID,
        AIMusicMeta: {
          variantCueIds: JSON.stringify(AIMusicMeta),
        },
        recentAIGeneratedData,
      });
      setTimeout(() => {
        closeModal?.(false);
      }, 500);
    })();
  }, [newVariants?.length]);

  useEffect(() => {
    // console.log("variantList", variantList);
    if (
      !!selectedGenre &&
      !!selectedMood &&
      !!selectedTempo &&
      !!variantList?.length
    ) {
      // console.log("variantList?.length", variantList?.length);
      // console.log("VARIATION_COUNT", VARIATION_COUNT);
      if (variantList?.length < VARIATION_COUNT) {
        GetTaskID(selectedGenre, selectedMood, getTempoValue(selectedTempo));
      } else {
        setNewVariants(variantList);
      }
    }
  }, [variantList?.length]);

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
    if (tagsToShow === "BRAND_TAGS") {
      dispatch(
        SET_AI_MUSIC_BRAND_CONFIG_META({
          AIMusicConfigByBrand: brandTagsArr,
        })
      );
    }
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
    if (genreArr?.length === 0 && MoodArr?.length === 0) {
      showNotification(
        "ERROR",
        "Mood and Genre data not available for this brand!"
      );
      navigate(`${NavStrings.PROJECTS}`);
      return;
    }
    setLoading(false);
  };

  const getBrandConfigData = (brand) => {
    setLoading(true);
    getBrandConfig({
      brand,
      onSuccess: onGetBrandConfigSuccess,
      onError: () => {
        setLoading(false);
      },
    });
  };

  const GetTaskID = async (selectedGenre, selectedMood, selectedTempo) => {
    setLoading(true);

    let body = {
      length: +jsonConfig?.CACHED_AI_MUSIC_LENGTH || 90,
      brand_tag_code: brandMeta?.tuneyBrandName,
      build: "none",
      genre: selectedGenre,
      mood: selectedMood,
      tempo: selectedTempo,
      flex_tracks: ["None"],
    };

    generateTrack({
      config: body,
      onSuccess: (response) => {
        generateCueID(response.data.task_id);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      // onProgress: (response) => {},
      onSuccess: (response) => {
        if (!!selectedAIMusicDetails?.cue_id) {
          getTrackVariant(response.data?.cue_id);
        } else {
          setvariantList((prev) => [response.data, ...prev]);
        }
      },
      onError: (err) => {
        console.log("err", err);
        setLoading(false);
      },
    });
  };

  const getDisableStyle = (array, value) => {
    if (array.length) {
      return {
        display: array.includes(value) ? "flex" : "none",
      };
    } else {
      return {};
    }
  };

  const getTrackVariant = (cueID) => {
    setLoading(true);
    generateTrackVariations({
      cueID,
      variationCount: VARIATION_COUNT,
      onSuccess: (response) => {
        getVariantTracksDetails(response.data?.task_id, cueID);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  const getVariantTracksDetails = (taskID, cueID) => {
    generateVariantCues({
      taskID,
      cueID,
      onProgress: () => {},
      onSuccess: async (response) => {
        setNewVariants(response.data?.cues);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div className="brand_tag_modal_container">
      <p className="header boldFamily">Choose Genre</p>
      <div className="selection_container_block">
        {genre.map((data) => (
          <div
            className="selection_container"
            key={data.label}
            style={getDisableStyle(activeGenre, data.label)}
            onClick={() => {
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
          >
            <div
              className={`selection_icon_container ${
                selectedGenre === data.label
                  ? "activeSelection"
                  : "deactiveSelection"
              }`}
            >
              <img
                className={`selection_icon`}
                src={getGenreTagMeta(data.label).icon}
                alt={data.label}
              />
            </div>
            <p className="selection_label">
              {getGenreTagMeta(data.label).label}
            </p>
          </div>
        ))}
      </div>
      <p className="header boldFamily">Choose Mood</p>
      <div className="selection_container_block">
        {mood.map((data) => (
          <div
            className="selection_container"
            key={data.label}
            style={getDisableStyle(activeMood, data.label)}
            onClick={() => {
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
          >
            <div
              className={`selection_icon_container ${
                selectedMood === data.label
                  ? "activeSelection"
                  : "deactiveSelection"
              }`}
            >
              <img
                className={`selection_icon `}
                src={getMoodTagMeta(data.label).icon}
                alt={data.label}
              />
            </div>
            <p className="selection_label">
              {getMoodTagMeta(data.label).label}
            </p>
          </div>
        ))}
      </div>
      <p className="header boldFamily">Choose Tempo</p>
      <div className="selection_container_block tempo_block">
        {tempoOptions?.map((tempo) => (
          <ButtonWrapper
            key={tempo}
            onClick={() => {
              if (selectedTempo === tempo) {
                setSelectedTempo(null);
              } else {
                setSelectedTempo(tempo);
              }
            }}
            className={`tempo_btn ${
              selectedTempo === tempo ? "selected_tempo" : ""
            }`}
          >
            {tempo}
          </ButtonWrapper>
        ))}
      </div>
      <div className="btn_container">
        {!hideCancelBtn && (
          <ButtonWrapper
            onClick={() => {
              closeModal?.(false);
            }}
          >
            Cancel
          </ButtonWrapper>
        )}
        <ButtonWrapper
          variant="filled"
          disabled={!(!!selectedGenre && !!selectedMood && !!selectedTempo)}
          onClick={() => {
            dispatch(
              SET_AI_MUSIC_META({
                playedCueID: null,
                playedInstrument: null,
                playedSonicLogo: null,
                selectedAIMusicConfig: {
                  genre: selectedGenre,
                  mood: selectedMood,
                  tempo: getTempoValue(selectedTempo),
                },
              })
            );
            dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
            GetTaskID(
              selectedGenre,
              selectedMood,
              getTempoValue(selectedTempo)
            );
          }}
        >
          Next
        </ButtonWrapper>
      </div>
    </div>
  );
};

export default BrandTagsModal;
