import { useEffect, useState } from "react";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import Layout from "../../../../common/components/layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import generateTrack from "../../services/TuneyAIMusic/generateTrack";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import randomIntFromInterval from "../../../../utils/randomIntFromInterval";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import { useConfig } from "../../../../customHooks/useConfig";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { AIMusicActions } from "../../constants/AIMusicActions";

const AITrackGenerationPage = () => {
  const { projectID } = useSelector((state) => state.projectMeta);
  const {
    recentAIGeneratedData,
    freshAITracksVariantsList,
    SSflaxTrackID,
    aiMusicGeneratorAnalysisDetails,
  } = useSelector((state) => state.AIMusic);
  const { brandMeta } = getCSUserMeta();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newVariants, setNewVariants] = useState(null);
  const VARIATION_COUNT = 5;
  const [variantList, setvariantList] = useState([]);
  const [tempoOptions, setTempoOptions] = useState(["fast", "slow", "random"]);
  const { config, jsonConfig } = useConfig();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const mood = decodeURIComponent(queryParams.get("mood") || "");
  const genre = decodeURIComponent(queryParams.get("genre") || "");
  const tempo = decodeURIComponent(queryParams.get("tempo") || "");
  const analysisId = decodeURIComponent(queryParams.get("analysisId") || "");

  useEffect(() => {
    dispatch(
      SET_AI_MUSIC_META({
        selectedAIMusicConfig: {
          genre: mood,
          mood: genre,
          tempo: getTempoValue(tempo),
        },
      })
    );
    GetTaskID(genre, mood, getTempoValue(tempo));
  }, []);

  const getTempoValue = (selectedTempo) => {
    if (selectedTempo !== "random") {
      return selectedTempo;
    }
    let randomIndex = randomIntFromInterval(0, tempoOptions?.length - 2);
    let randomTempo = tempoOptions[randomIndex];
    return randomTempo;
  };

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
      console.log("filteredVariantsObj", filteredVariantsObj);
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
        ai_analysis_id: analysisId,
      }));
      addAIMusicResponse({
        responseMeta: AIMusicTrackDetails,
        onSuccess: () => {
          const updatedAiMusicGeneratorAnalysisDetails =
            aiMusicGeneratorAnalysisDetails?.map((item) => {
              if (Number(analysisId) === Number(item?.id)) {
                return {
                  description: item.description,
                  fileName: item.fileName,
                  id: item.id,
                  mediatype: item.mediatype,
                  genre: item.genre,
                  mood: item.mood,
                  tempo: item.tempo,
                  status: item.status,
                  isTuneyTrackGenerated: true,
                };
              } else {
                return item;
              }
            });
          dispatch(
            SET_AI_MUSIC_META({
              aiMusicGeneratorAnalysisDetails:
                updatedAiMusicGeneratorAnalysisDetails,
            })
          );
          updateAIMusicMeta({
            projectID,
            AIMusicMeta: {
              variantCueIds: JSON.stringify(AIMusicMeta),
            },
            recentAIGeneratedData,
            onSuccess: () => {
              navigate(getWorkSpacePath(projectID, null));
            },
          });
        },
        onError: () => {},
      });
    })();
  }, [newVariants?.length]);

  useEffect(() => {
    // console.log("variantList", variantList);
    if (!!mood && !!genre && !!tempo && !!variantList?.length) {
      console.log("variantList?.length", variantList?.length);
      console.log("VARIATION_COUNT", VARIATION_COUNT);
      if (variantList?.length < VARIATION_COUNT) {
        GetTaskID(genre, mood, getTempoValue(tempo));
      } else {
        setNewVariants(variantList);
        return;
      }
    }
  }, [variantList?.length]);

  const GetTaskID = (selectedGenre, selectedMood, selectedTempo) => {
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
      onError: () => {},
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => {},
      onSuccess: (response) => {
        setvariantList((prev) => [response.data, ...prev]);
      },
      onError: () => {},
    });
  };

  return (
    <Layout>
      <CustomLoader processPercent={-1} />
    </Layout>
  );
};

export default AITrackGenerationPage;
