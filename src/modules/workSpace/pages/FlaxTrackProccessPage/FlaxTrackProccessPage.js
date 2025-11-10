import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import Layout from "../../../../common/components/layout/Layout";
import NavStrings from "../../../../routes/constants/NavStrings";
import generateTrack from "../../services/TuneyAIMusic/generateTrack";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import { useConfig } from "../../../../customHooks/useConfig";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import regenerateTrack from "../../services/TuneyAIMusic/regenerateTrack";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { AIMusicActions } from "../../constants/AIMusicActions";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import getAIMusicEndingOption from "../../helperFunctions/getAIMusicEndingOption";
import { last } from "lodash";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import axios from "axios";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_AI_MUSIC_Stability_META } from "../../redux/AIMusicStabilitySlice";

const FlaxTrackProccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const { projectDurationInsec, projectID } = useSelector(
    (state) => state.projectMeta
  );
  const { flaxTrackID, recentAIGeneratedData, isCSTrack, SSflaxTrackID } =
    useSelector((state) => state.AIMusic);

  const { config } = useConfig();
  let { brandMeta } = getCSUserMeta();

  useEffect(() => {
    if (brandMeta?.aiMusicProvider === "stability" && flaxTrackID) {
      setProcessStatus(true);

      const data = {
        requestId: flaxTrackID,
        duration: projectDurationInsec,
        projectId: projectID,
        type: 2,
      };

      axiosCSPrivateInstance
        .post("/stability/requestId", data)
        .then((response) => {
          //console.log("/stability/requestId response", response);
          dispatch(
            SET_AI_MUSIC_Stability_META({
              stabilityMP3TracksArr: [response?.data],
            })
          );
          let projectMeta = {
            assets: "AI Music",
          };
          updateProjectMeta({
            projectID,
            projectMeta,
            onSuccess: (res) => {},
          });
          let getUniqueKeyFromFileName = response?.data
            .replace(/\.mp3$/i, "")
            .split("_")
            .pop()
            .replace(/stability$/i, "");

          navigate(getWorkSpacePath(projectID, getUniqueKeyFromFileName));
        })
        .catch((err) => {
          setProcessStatus(false);
          console.error("Error in /stability/requestId:", err);
        });
    } else if (isCSTrack && !!flaxTrackID) {
      setProcessStatus(true);
      let projectObj = {
        mods: [
          {
            section: "all",
            type: "length",
            value: projectDurationInsec + "",
          },
        ],
      };
      regenerateTrack({
        cueID: flaxTrackID,
        config: projectObj,
        onSuccess: (response) =>
          generateFlaxTrackDetails(response.data.task_id),
        onError: () => {
          setProcessStatus(false);
          navigate(NavStrings.PROJECTS);
        },
      });
    } else if (!isCSTrack && !!flaxTrackID) {
      setProcessStatus(true);
      generateTaskID(flaxTrackID);
    } else {
      navigate(NavStrings.PROJECTS);
    }
  }, []);

  const generateTaskID = (flaxTrackID) => {
    let data = {
      build: "none",
      length: +projectDurationInsec || 90,
      flex_tracks: [flaxTrackID],
      brand_tag_code: "None",
    };

    generateTrack({
      config: data,
      onSuccess: (response) => {
        generateFlaxTrackDetails(response.data.task_id);
      },
      onError: () => {
        setProcessStatus(false);
        navigate(`${NavStrings.PROJECTS}`);
      },
    });
  };

  const onGenerateCueSuccess = async (response) => {
    const AITrackMetaGeneration = [
      {
        mood: response?.data?.settings?.mood,
        genre: response?.data?.settings?.genre,
        tempo: response?.data?.settings?.tempo,
      },
    ];
    let tracknamesArr = await getVariantsTrackNamesAndDescription(
      AITrackMetaGeneration,
      config?.modules?.TRACK_NAME_DESCRIPTION_BY_OPEN_AI,
      getLastVariantCount(recentAIGeneratedData)
    );
    const flaxId =
      (response?.data?.sections?.[0]?.flax_tracks?.[0] === "None"
        ? ""
        : response?.data?.sections?.[0]?.flax_tracks?.[0] || "") ||
      SSflaxTrackID;
    let AIMusicTrackDetails = [
      {
        mood: response?.data?.settings?.mood,
        genre: response?.data?.settings?.genre,
        tempo: response?.data?.settings?.tempo,
        length: response?.data?.settings?.length,
        name: tracknamesArr?.[0]?.name || response?.data?.name,
        description: tracknamesArr?.[0]?.description || "-",
        cue_id: response?.data?.cue_id,
        flax_id: flaxId,
        parent_cue_id: response?.data?.parent_cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        action: AIMusicActions.FLAX_TRACK,
        project_id: projectID,
      },
    ];
    addAIMusicResponse({
      responseMeta: AIMusicTrackDetails,
      onSuccess: () => {
        updateAIMusicMeta({
          projectID,
          AIMusicMeta: {
            cueId: response?.data?.cue_id,
            sonic_logo_id:
              response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
            flax_id: flaxId,
            variantCueIds: JSON.stringify([
              {
                label: tracknamesArr?.[0]?.name || response?.data?.name,
                value: response?.data?.cue_id,
                desc: tracknamesArr?.[0]?.description || "-",
                parentCueId: response?.data?.parent_cue_id,
                action: AIMusicActions.FLAX_TRACK,
              },
            ]),
          },
          recentAIGeneratedData,
          onSuccess: () => {
            setProcessStatus(false);
            console.log(
              "navigating to",
              getWorkSpacePath(projectID, response?.data?.cue_id)
            );
            dispatch(
              SET_AI_MUSIC_META({
                trackDuration: response?.data?.settings?.length,
                dropPosition:
                  response?.data?.cue_parameters?.transition?.time ||
                  response?.data?.settings?.length * 0.25,
                stemVolume: response?.data?.volumes?.[0],
                isDrop: Boolean(
                  response?.data?.cue_parameters?.transition?.time
                ),
                endingOption: getAIMusicEndingOption(
                  last(response?.data?.sections)?.ending
                )?.value,
                selectedAIMusicDetails: {
                  ...response?.data,
                  label: tracknamesArr?.[0]?.name || response?.data?.name,
                  value: response?.data?.cue_id,
                  desc: tracknamesArr?.[0]?.description || "-",
                  parentCueId: response?.data?.parent_cue_id,
                  action: AIMusicActions.FLAX_TRACK,
                },
                sonicLogoId:
                  response?.data?.custom_stems?.cue_logo?.[0]?.effect_id ||
                  null,
                flaxTrackID:
                  response?.data?.sections?.[0]?.flax_tracks?.[0] === "None"
                    ? ""
                    : response?.data?.sections?.[0]?.flax_tracks?.[0] || "",
                cueID: response?.data?.cue_id,
                playedInstrument: null,
                playedCueID: null,
                playedSonicLogo: null,
              })
            );
            navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
          },
          onError: () => {
            setProcessStatus(false);
            navigate(`${NavStrings.PROJECTS}`);
          },
        });
      },
    });
  };

  const generateFlaxTrackDetails = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => setProcessPercent(response.data.progress * 100),
      onSuccess: onGenerateCueSuccess,
      onError: () => {
        setProcessStatus(false);
        navigate(`${NavStrings.PROJECTS}`);
      },
    });
  };

  return (
    <Layout>
      {processStatus && <CustomLoader processPercent={processPercent} />}
    </Layout>
  );
};

export default FlaxTrackProccessPage;
