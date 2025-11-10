import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../common/redux/loaderSlice";
import { store } from "../../../reduxToolkit/store";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import getLastVariantCount from "../../../utils/getLastVariantCount";
import getWorkSpacePath from "../../../utils/getWorkSpacePath";
import { formatAIGenAnalysisResponse } from "../../../utils/formatAIGenAnalysisResponse";
import { AIMusicActions } from "../constants/AIMusicActions";
import { SET_AI_MUSIC_META } from "../redux/AIMusicSlice";
import { SET_PROJECT_META } from "../redux/projectMetaSlice";
import addAIMusicResponse from "../services/AIMusicDB/addAIMusicResponse";
import updateAIMusicMeta from "../services/AIMusicDB/updateAIMusicMeta";
import generateAITrack from "../services/TuneyAIMusic/generateAITrack";
import getAIAnalysisType from "./getAIAnalysisType";
import getTempoCategory from "./getTempoCategory";
import getVariantsTrackNamesAndDescription from "./getVariantsTrackNamesAndDescription";

const storeTracksAndUpdateState = async ({
  dispatch,
  navigate,
  newVariantsArr,
  analysisId,
  aiMusicGeneratorAnalysisDetails,
  recentAIGeneratedData,
  freshAITracksVariantsList,
  SSflaxTrackID,
  projectID,
  config,
}) => {
  console.log("newVariantsArr", newVariantsArr);
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
          dispatch(RESET_LOADING_STATUS());
          const hasTrackList =
            document.querySelector(
              ".fresh_AI_variants_container, .no_data_found_ai_tracks, .recent_music_container"
            ) !== null;
          if (!hasTrackList) {
            navigate(getWorkSpacePath(projectID, null));
          }
        },
      });
    },
    onError: () => {},
  });
};

export const generateAllAITracks = async ({
  combinationStr,
  dispatch,
  navigate,
  analysisId,
  recentAIGeneratedData,
  freshAITracksVariantsList,
  SSflaxTrackID,
  projectID,
  config,
  jsonConfig,
  brandMeta,
  aiMusicGeneratorAnalysisDetails,
}) => {
  dispatch(
    SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
  );
  dispatch(
    SET_PROJECT_META({
      activeWSTab: "AI Music",
    })
  );
  try {
    console.log("combinationStr", combinationStr);
    const combinationResponse = JSON.parse(combinationStr);
    console.log("combinationResponse", combinationResponse);
    const formattedAnalysisResponse =
      formatAIGenAnalysisResponse(combinationResponse);
    console.log("formattedAnalysisResponse", formattedAnalysisResponse);

    if (!formattedAnalysisResponse || formattedAnalysisResponse?.length === 0)
      return [];

    const bodies = formattedAnalysisResponse?.map(([genre, mood, tempo]) => ({
      length: +jsonConfig?.CACHED_AI_MUSIC_LENGTH || 90,
      brand_tag_code: brandMeta?.tuneyBrandName,
      build: "none",
      mood,
      genre,
      tempo,
      flex_tracks: ["None"],
    }));
    const promises = bodies.map((body) => generateAITrack(body));
    const trackMeta = await Promise.all(promises);
    console.log("trackMeta generateAITrack::", trackMeta);
    storeTracksAndUpdateState({
      dispatch,
      navigate,
      newVariantsArr: trackMeta,
      analysisId,
      aiMusicGeneratorAnalysisDetails,
      recentAIGeneratedData,
      freshAITracksVariantsList,
      SSflaxTrackID,
      projectID,
      config,
    });
  } catch (error) {
    dispatch(RESET_LOADING_STATUS());
    console.error("Error generating AI tracks:", error);
    return [];
  }
};

export const getAIAnalysisStatus = ({
  onSuccess,
  onError,
  onFinally,
  analysisId,
  navigate,
  setPollingModal,
  stopPollingRequest,
  config,
  jsonConfig,
}) => {
  let dispatch = store.dispatch;
  const { brandMeta } = getCSUserMeta();

  axiosCSPrivateInstance
    .get(`ai_analysis/getByAnalysisId/${analysisId}`)
    .then(async (response) => {
      const data = response.data;
      onSuccess?.(data);
      if (data?.status === "completed") {
        console.log("data", data);

        const {
          AIMusic: {
            aiMusicGeneratorAnalysisDetails,
            recentAIGeneratedData,
            freshAITracksVariantsList,
            SSflaxTrackID,
          },
          projectMeta: { projectID },
        } = store.getState();

        // Find index based on mediatype
        const index = aiMusicGeneratorAnalysisDetails.findIndex(
          (item) => item.mediatype === data.mediatype
        );

        const newAiMusicGeneratorAnalysisDetails = [
          ...aiMusicGeneratorAnalysisDetails,
        ];
        const updatedData = {
          ...data,
          tempo: getTempoCategory(data?.tempo),
          type: getAIAnalysisType(data?.mediatype),
          mediatype: data?.mediatype?.toString(),
          isTuneyTrackGenerated: data?.processed ?? false,
        };
        // If found, replace the object
        if (index !== -1) {
          newAiMusicGeneratorAnalysisDetails[index] = updatedData;
        } else {
          // Else, add the object
          newAiMusicGeneratorAnalysisDetails.push(updatedData);
        }
        console.log("updatedData", updatedData);

        // const AIMusic
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorProgress: null,
            aiMusicGeneratorAnalysisDetails: newAiMusicGeneratorAnalysisDetails,
          })
        );
        stopPollingRequest();
        await generateAllAITracks({
          combinationStr: data?.aiGenData,
          dispatch,
          navigate,
          analysisId,
          recentAIGeneratedData,
          freshAITracksVariantsList,
          SSflaxTrackID,
          projectID,
          config,
          jsonConfig,
          brandMeta,
          aiMusicGeneratorAnalysisDetails: newAiMusicGeneratorAnalysisDetails,
        });
      } else if (data?.status === "failed") {
        showNotification("ERROR", "Status: Failed!");
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorProgress: null,
          })
        );
        stopPollingRequest();
      } else {
        setPollingModal?.(true);
      }
    })
    .catch((error) => {
      onError?.();
      stopPollingRequest();
      console.error("Error in request:", error);
      showNotification("ERROR", "Something went wrong!");
      dispatch(
        SET_AI_MUSIC_META({
          aiMusicGeneratorProgress: null,
        })
      );
    })
    .finally(() => {
      onFinally?.();
    });
};
