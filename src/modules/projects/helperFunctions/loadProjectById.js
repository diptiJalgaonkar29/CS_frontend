import { current } from "@reduxjs/toolkit";
import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../common/helperFunctions/showNotification";
import { store } from "../../../reduxToolkit/store";
import NavStrings from "../../../routes/constants/NavStrings";
import getCSUserMeta from "../../../utils/getCSUserMeta";
import getWorkSpacePath from "../../../utils/getWorkSpacePath";
import getAIAnalysisType from "../../workSpace/helperFunctions/getAIAnalysisType";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../workSpace/redux/AIMusicSlice";
import { SET_AI_MUSIC_Stability_META } from "../../workSpace/redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../workSpace/redux/AITrackStabilitySlice";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../workSpace/redux/projectMetaSlice";
import {
  RESET_VIDEO_META,
  SET_VIDEO_META,
} from "../../workSpace/redux/videoSlice";
import { RESET_VOICE_META } from "../../workSpace/redux/voicesSlice";
import getLikeDislikeAIMusicList from "../../workSpace/services/AIMusicDB/getLikeDislikeAIMusicList";
import getRecentGeneratedCueIds from "../../workSpace/services/AIMusicDB/getRecentGeneratedCueIds";
import getProjectVoiceDetails from "../../workSpace/services/voiceDB/getProjectVoiceDetails";
import getProjectsById from "../services/getProjectsById";
import getStabilityById from "../services/getStabilityById";

const getActiveWSTab = (appAccess, condition) => {
  if (appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
    return condition ? "Voice" : "AI Music";
  } else if (!appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
    return "Voice";
  } else if (appAccess?.AI_MUSIC && !appAccess?.AI_VOICE) {
    return "AI Music";
  } else {
    return "Voice";
  }
};

const loadProjectById = (projectId, navigate) => {
  const dispatch = store.dispatch;
  const { brandMeta } = getCSUserMeta();

  dispatch(RESET_VIDEO_META());
  dispatch(RESET_VOICE_META());
  dispatch(RESET_AI_MUSIC_META());
  dispatch(RESET_PROJECT_META());

  getProjectsById({
    projectId,
    onSuccess: async (response) => {
      const projectMeta = response.data;

      if (
        ["project not found", "somthingwentwrong"].includes(projectMeta?.status)
      ) {
        showNotification("ERROR", "Project not found!");
        return navigate(NavStrings.PROJECTS);
      }

      // flow control for active tab in workspace for stability
      if (brandMeta?.aiMusicProvider == "stability") {
        getStabilityById({
          projectId,
          onSuccess: async (response) => {
            // response.data: { projectMeta, analysisDetails, files }
            let stabilityResponse = response.data;
            let stabilitymp3Url = stabilityResponse?.map((e) => e?.fileName)
            let currentUseThisTrackFromGetByProjectId = (stabilityResponse || []).find(item => item.usedMp3);

            // Fetch blobs for each file and create object URLs
            if (Array.isArray(stabilityResponse)) {
              try {
                const fileRequests = stabilityResponse.map(async (file) => {
                  const res = await axiosCSPrivateInstance.get(`/stability/GetMediaFile/${projectId}/${file?.fileName}`,
                    { responseType: "blob" }
                  );

                  // Dispatch file info along with meta
                  dispatch(
                    SET_PROJECT_META({
                      projectID: file?.projectId,
                      projectDurationInsec: +file?.duration,
                    })
                  );
                  // return enriched file for later if needed
                  return res
                });

                const results = await Promise.all(fileRequests);

                // Create object URLs for each blob
                const objectURLArr = results.map((res) => URL.createObjectURL(res.data)) || [];


                console.log("currentUseThisTrackFromGetByProjectId", currentUseThisTrackFromGetByProjectId?.usedMp3);
                dispatch(
                  SET_AI_Track_Stability_META({ stabilityArr: objectURLArr, currentUseThisTrack: currentUseThisTrackFromGetByProjectId?.usedMp3 || [] })
                );

                dispatch(
                  SET_AI_MUSIC_Stability_META({ stabilityLoading: false, stabilityMP3TracksArr: stabilitymp3Url, latestFiledataStability: stabilityResponse })
                );

                dispatch(
                  SET_PROJECT_META({
                    projectName: projectMeta?.project_name,
                    projectID: projectMeta?.project_id,
                    projectDurationInsec: +projectMeta?.duration,
                    projectDescription: projectMeta?.description,
                    assetsType: projectMeta?.assets,
                    timelineVoiceVolume: projectMeta?.voice_layer_volume ?? 1,
                    timelineMusicVolume: projectMeta?.music_layer_volume ?? 1,
                  })
                );

                console.log('projectMeta?.taxonomy_split_type', projectMeta?.taxonomy_split_type)
                console.log('projectMeta?.taxonomy_Status', projectMeta?.taxonomy_Status)

                if (!!projectMeta?.file_name) {
                  dispatch(
                    SET_VIDEO_META({
                      uploadedVideoURL: projectMeta?.file_name,
                      coverImage: projectMeta?.cover_image,
                      tXStatus: projectMeta?.taxonomy_Status,
                      tXsplit: projectMeta?.taxonomy_split_type,
                      tXfilePath: projectMeta?.taxonomy_mp3file,
                      tXId: projectMeta?.taxonomy_id,
                    })
                  );
                  dispatch(
                    SET_PROJECT_META({
                      isVideoProcessing:
                        projectMeta?.video_Status === "pending" ||
                          !projectMeta?.video_Status
                          ? true
                          : false,
                    })
                  );
                }

                // To fetch voice data, if voice from video not retained
                if (projectMeta?.taxonomy_split_type !== "0") {
                  await getProjectVoiceDetails(projectMeta?.project_id);
                }

                if (!!currentUseThisTrackFromGetByProjectId) {
                  console.log("currentUseThisTrackFromGetByProjectId", currentUseThisTrackFromGetByProjectId?.usedMp3)
                  navigate(
                    getWorkSpacePath(projectMeta?.project_id, currentUseThisTrackFromGetByProjectId?.usedMp3), { replace: true }
                  );
                } else {
                  console.log("called from else")
                  navigate(getWorkSpacePath(projectMeta?.project_id, null));
                }

              } catch (err) {
                console.error("Error fetching one or more MP3 files:", err);
                showNotification("ERROR", "Failed to fetch generated audio files.");
              }
            }

          }
        });
      } else {
        try {
          const projectId = response?.data?.project_id;
          if (!projectId) return;


          const { data: aiAnalysis } = await axiosCSPrivateInstance.get(`ai_analysis/getAllRecentAnylysisData/${projectId}`
          );

          console.log("aiAnalysis", aiAnalysis);

          // Assuming aiAnalysis is an array of items
          let progressItems = {};
          const completedItems = [];

          aiAnalysis?.forEach((item) => {
            if (item?.status === "in_progress" || item?.status === "not_send") {
              progressItems = {
                id: item?.id,
                status: item?.status,
                mediatype: item?.mediatype?.toString(),
              };
            } else console.log("item", item);
            if (item?.status === "completed") {
              completedItems.push({
                id: item?.id,
                aiGenData: item?.aiGenData,
                type: getAIAnalysisType(item?.mediatype),
                fileName: item?.fileName || "",
                description: item?.description,
                mediatype: item?.mediatype?.toString(),
                status: item?.status,
                isTuneyTrackGenerated: item?.processed,
              });
            }
          });

          dispatch(
            SET_AI_MUSIC_META({
              aiMusicGeneratorProgress: progressItems,
              aiMusicGeneratorAnalysisDetails: completedItems,
            })
          );
        } catch (error) {
          console.error("Failed to fetch AI analysis data:", error);
        }

        dispatch(
          SET_PROJECT_META({
            projectName: projectMeta?.project_name,
            projectID: projectMeta?.project_id,
            projectDurationInsec: +projectMeta?.duration,
            projectDescription: projectMeta?.description,
            assetsType: projectMeta?.assets,
            timelineVoiceVolume: projectMeta?.voice_layer_volume ?? 1,
            timelineMusicVolume: projectMeta?.music_layer_volume ?? 1,
          })
        );

        if (!!projectMeta?.cue_id) {
          dispatch(
            SET_AI_MUSIC_META({
              cueID: projectMeta?.cue_id,
              SSflaxTrackID: projectMeta?.flax_id,
            })
          );
        }

        if (
          !!projectMeta?.ai_analysis_status ||
          ["video", "brief", "tags", "Voice"].includes(projectMeta?.ai_analysis)
        ) {
          console.log("projectMeta", projectMeta);
          dispatch(
            SET_AI_MUSIC_META({
              aiMusicGenerator: {
                id: projectMeta?.ai_analysis_request_id,
                status: projectMeta?.ai_analysis_status,
                projectFlow: projectMeta?.ai_analysis,
              },
            })
          );
        }

        if (!!projectMeta?.file_name) {
          dispatch(
            SET_VIDEO_META({
              uploadedVideoURL: projectMeta?.file_name,
              coverImage: projectMeta?.cover_image,
              tXStatus: projectMeta?.taxonomy_Status,
              tXsplit: projectMeta?.taxonomy_split_type,
              tXfilePath: projectMeta?.taxonomy_mp3file,
              tXId: projectMeta?.taxonomy_id,
            })
          );
          dispatch(
            SET_PROJECT_META({
              isVideoProcessing:
                projectMeta?.video_Status === "pending" ||
                  !projectMeta?.video_Status
                  ? true
                  : false,
            })
          );
        }

        // To fetch voice data, if voice from video not retained
        if (projectMeta?.taxonomy_split_type !== "0") {
          await getProjectVoiceDetails(projectMeta?.project_id);
        }

        // To fetch previous generated AI music
        getRecentGeneratedCueIds({
          projectID: projectMeta?.project_id,
          onSuccess: (recentCueIdsResponse) => {
            let variantCueIds;
            let variantCueIdsWithType;
            try {
              variantCueIds = JSON.parse(
                recentCueIdsResponse.data?.variantCueIds || []
              );
              variantCueIdsWithType = variantCueIds.map((item) => ({
                ...item,
                type: "recentAIGeneratedData",
              }));
            } catch (error) {
              variantCueIds = [];
              variantCueIdsWithType = [];
            }
            dispatch(
              SET_AI_MUSIC_META({
                recentAIGeneratedData: variantCueIds,
                freshAITracksVariantsList: variantCueIdsWithType,
              })
            );

            // To fetch like dislike data
            getLikeDislikeAIMusicList({
              projectId: projectMeta?.project_id,
              onSuccess: () => { },
            });

            if (!!projectMeta?.cue_id) {
              navigate(
                getWorkSpacePath(projectMeta?.project_id, projectMeta?.cue_id)
              );
            } else {
              navigate(getWorkSpacePath(projectMeta?.project_id, null));
            }
          },
        });

      }
      // ending else of stability

      console.log("Project fetched successfully", projectMeta);

    },
  });
};

export default loadProjectById;
