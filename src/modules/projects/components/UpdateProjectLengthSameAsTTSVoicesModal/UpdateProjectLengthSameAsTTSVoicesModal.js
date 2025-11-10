import React from "react";
import "./UpdateProjectLengthSameAsTTSVoicesModal.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import { useDispatch, useSelector } from "react-redux";
import { SET_VOICE_META } from "../../../workSpace/redux/voicesSlice";
import { SET_AI_MUSIC_META } from "../../../workSpace/redux/AIMusicSlice";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";
import updateProjectMeta from "../../../workSpace/services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../../workSpace/redux/projectMetaSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import regenerateTrack from "../../../workSpace/services/TuneyAIMusic/regenerateTrack";
import generateCue from "../../../workSpace/services/TuneyAIMusic/generateCue";
import addAIMusicResponse from "../../../workSpace/services/AIMusicDB/addAIMusicResponse";
import updateAIMusicMeta from "../../../workSpace/services/AIMusicDB/updateAIMusicMeta";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { last } from "lodash";
import divideDurationBySections from "../../../../utils/divideDurationBySections";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import formatTime from "../../../../utils/formatTime";
import { AIMusicActions } from "../../../workSpace/constants/AIMusicActions";
import { useNavigate } from "react-router-dom";

const UpdateProjectLengthSameAsTTSVoicesModal = () => {
  const {
    TTSTimelineVoicesMP3,
    isUpdateProjectLengthSameAsTTSVoicesModalOpen,
  } = useSelector((state) => state.voices);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const {
    selectedAIMusicDetails,
    recentAIGeneratedData,
    SSflaxTrackID,
    sonicLogoId,
  } = useSelector((state) => state.AIMusic);

  const lastVoiceItem = last(TTSTimelineVoicesMP3);
  const ttsVoicesEndPoint = roundUpToDecimal(
    Math.ceil(+lastVoiceItem?.startPoint + +lastVoiceItem?.duration)
  );
  // console.log("ttsVoicesEndPoint", ttsVoicesEndPoint);
  const onClose = () => {
    dispatch(
      SET_VOICE_META({ isUpdateProjectLengthSameAsTTSVoicesModalOpen: false })
    );
  };

  const generateProjectLength = async () => {
    let newProjectDurationInsec = ttsVoicesEndPoint;
    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: null,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    console.log("selectedAIMusicDetails", selectedAIMusicDetails);
    let projectDuration = roundUpToDecimal(newProjectDurationInsec);
    let selectedTrackDuration = roundUpToDecimal(
      selectedAIMusicDetails?.settings?.length
    );
    console.log("projectDuration", projectDuration);
    console.log("selectedTrackDuration", selectedTrackDuration);
    console.log(
      "projectDuration >= selectedTrackDuration",
      projectDuration >= selectedTrackDuration
    );
    if (
      !selectedAIMusicDetails?.cue_id ||
      (!!selectedAIMusicDetails?.custom_stems?.cue_logo?.[0]?.effect_id &&
        projectDuration >= selectedTrackDuration)
    ) {
      dispatch(
        SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
      );
      let projectMeta = {
        duration: +newProjectDurationInsec,
      };
      updateProjectMeta({
        projectID,
        projectMeta,
        onSuccess: () => {
          showNotification("SUCCESS", "Project length updated succesfully!");
          dispatch(
            SET_PROJECT_META({
              projectDurationInsec: +newProjectDurationInsec,
            })
          );
          dispatch(RESET_LOADING_STATUS());
          onClose();
        },
        onError: () => {
          dispatch(RESET_LOADING_STATUS());
          onClose();
        },
      });
      return;
    }
    dispatch(
      SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: 0 })
    );

    console.log(
      "divideDurationBySections***",
      selectedAIMusicDetails?.sections?.length,
      newProjectDurationInsec,
      selectedAIMusicDetails?.cue_parameters?.transition?.time,
      divideDurationBySections(
        selectedAIMusicDetails?.sections?.length,
        newProjectDurationInsec,
        selectedAIMusicDetails?.cue_parameters?.transition?.time
      )
    );

    let newModArr = divideDurationBySections(
      selectedAIMusicDetails?.sections?.length,
      newProjectDurationInsec,
      selectedAIMusicDetails?.cue_parameters?.transition?.time
    )?.map((sectionLength, index) => ({
      section: index + "",
      type: "length",
      value: sectionLength + "",
    }));

    // if (!!sonicLogoId) {
    //   newModArr.push({
    //     section: "all",
    //     type: "ending",
    //     value: "logo",
    //     param1: sonicLogoId,
    //   });
    // }

    let projectObj = {
      mods: newModArr,
    };

    regenerateTrack({
      cueID: selectedAIMusicDetails?.cue_id,
      config: projectObj,
      onSuccess: (response) => generateCueID(response.data.task_id),
      onError: () => {
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  const onGenerateCueSuccess = async (response) => {
    let newProjectDurationInsec = ttsVoicesEndPoint;

    let trackTitle =
      selectedAIMusicDetails?.label?.split("##")?.[0] || response?.data?.name;
    let trackDescription = selectedAIMusicDetails.desc || "-";
    const action = `duration updated to ${formatTime(
      +newProjectDurationInsec
    )}`;
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
        name: trackTitle,
        description: trackDescription,
        cue_id: response?.data?.cue_id,
        parent_cue_id: response?.data?.parent_cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        action: AIMusicActions.LENGTH_CHANGE,
        project_id: projectID,
      },
    ];
    addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: response?.data?.cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        variantCueIds: JSON.stringify([
          {
            label: `${trackTitle}##${action}`,
            value: response?.data?.cue_id,
            desc: trackDescription,
            parentCueId: response?.data?.parent_cue_id,
            action: AIMusicActions.LENGTH_CHANGE,
          },
        ]),
      },
      recentAIGeneratedData,
      onSuccess: () => {
        showNotification("SUCCESS", "Project length updated succesfully!");
        let projectMeta = {
          duration: +newProjectDurationInsec,
        };
        updateProjectMeta({
          projectID,
          projectMeta,
        });
        dispatch(
          SET_PROJECT_META({
            // activeWSTab: "AI Music",
            projectDurationInsec: +newProjectDurationInsec,
          })
        );
        dispatch(
          SET_AI_MUSIC_META({
            previousCueID: null,
            redoCueID: null,
          })
        );
        // dispatch(RESET_TTS_TIMELINE_VOICES());
        onClose();
        dispatch(RESET_LOADING_STATUS());
        navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
      },
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      onProgress: (response) => {
        dispatch(
          SET_LOADING_STATUS({
            loaderStatus: true,
            loaderProgressPercent: response.data.progress * 100,
          })
        );
      },
      onSuccess: (res) => onGenerateCueSuccess(res),
      onError: () => {
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  return (
    <ModalWrapper
      isOpen={isUpdateProjectLengthSameAsTTSVoicesModalOpen}
      onClose={onClose}
      title="Update length of the project"
    >
      <div className="update_length_modal_content">
        <p className="update_length_message">
          Do you want to extend the project’s length to
          <span className="project_duration">
            {formatTime(ttsVoicesEndPoint)}
          </span>
          from
          <span className="project_duration">
            {formatTime(projectDurationInsec)}
          </span>
          to accommodate all voice inputs?
        </p>
        {/* <p className="update_length_message">
          All deleted projects will be stored in ”Archive” for 90 days after
          this action.
        </p> */}
        <div className="update_length_modal_btns">
          <ButtonWrapper onClick={() => onClose()}>Cancel</ButtonWrapper>
          <ButtonWrapper variant="filled" onClick={generateProjectLength}>
            Update
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UpdateProjectLengthSameAsTTSVoicesModal;
