import React, { useEffect, useState } from "react";
import "./BrandTagsPage.css";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import Layout from "../../../../common/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import NavStrings from "../../../../routes/constants/NavStrings";
import generateTrack from "../../services/TuneyAIMusic/generateTrack";
import getBrandConfig from "../../services/TuneyAIMusic/getBrandConfig";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import getGroupByData from "../../../../utils/getGroupByData";
import {
  getGenreTagMeta,
  getMoodTagMeta,
} from "../../helperFunctions/getBrandTagMeta";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import randomIntFromInterval from "../../../../utils/randomIntFromInterval";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { SET_AI_MUSIC_BRAND_CONFIG_META } from "../../redux/AIMusicbrandConfigsSlice";
import { useConfig } from "../../../../customHooks/useConfig";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { AIMusicActions } from "../../constants/AIMusicActions";

const BrandTagsPage = () => {
  const { projectID } = useSelector((state) => state.projectMeta);
  const { recentAIGeneratedData, freshAITracksVariantsList, SSflaxTrackID } =
    useSelector((state) => state.AIMusic);
  const { AIMusicConfigByBrand } = useSelector((state) => state.brandConfigs);
  const { brandMeta } = getCSUserMeta();
  const [genre, setGenre] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [mood, setMood] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTempo, setSelectedTempo] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [brandTags, setBrandTags] = useState(null);
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

  useEffect(() => {
    if (AIMusicConfigByBrand && AIMusicConfigByBrand?.length > 0) {
      setBrandTags(AIMusicConfigByBrand);
      loadMoodAndGenre(AIMusicConfigByBrand);
    } else {
      getBrandConfigData(brandMeta?.tuneyBrandName);
    }
  }, []);

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
      dispatch(
        SET_AI_MUSIC_META({
          freshAITracksVariantsList: [
            ...filteredVariantsObj,
            ...(freshAITracksVariantsList ?? []),
          ],
        })
      );
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
              setLoadingConfig(false);
              navigate(getWorkSpacePath(projectID, null));
            },
          });
        },
        onError: () => setLoadingConfig(false),
      });
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
        return;
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

  const GetTaskID = (selectedGenre, selectedMood, selectedTempo) => {
    setLoadingConfig(true);

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
        setLoadingConfig(false);
      },
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => {},
      onSuccess: (response) => {
        setvariantList((prev) => [response.data, ...prev]);
      },
      onError: () => {
        setLoadingConfig(false);
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

  if (loadingConfig || genre?.length === 0 || mood?.length === 0) {
    return <CustomLoader />;
  }

  return (
    <Layout>
      <div className="MG_wrapper">
        <div className="MG_container">
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
          <div className="MG_btn_container">
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
      </div>
    </Layout>
  );
};

export default BrandTagsPage;
