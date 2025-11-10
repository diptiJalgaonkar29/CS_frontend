import React, { useEffect } from "react";
import "./EditProjectLengthModal.css";
import { ReactComponent as EditIcon } from "../../../../static/common/edit.svg";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import regenerateTrack from "../../services/TuneyAIMusic/regenerateTrack";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import formatTime from "../../../../utils/formatTime";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import DurationCounter from "../DurationCounter/DurationCounter";
import {
  RESET_LOADING_STATUS,
  SET_LOADING_STATUS,
} from "../../../../common/redux/loaderSlice";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import divideDurationBySections from "../../../../utils/divideDurationBySections";
import { AIMusicActions } from "../../constants/AIMusicActions";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import InputWrapper from "../../../../branding/componentWrapper/InputWrapper";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import TextAreaWrapper from "../../../../branding/componentWrapper/TextAreaWrapper";
import RadioWrapper from "../../../../branding/componentWrapper/RadioWrapper";

export default function EditProjectLengthModal({ isOpen, onOpen, onClose }) {
  const MAX_DURATION = 60;
  const MIN_DURATION = 0;
  const {
    projectID,
    projectDurationInsec,
    dropPosition,
    projectName,
    projectDescription,
  } = useSelector((state) => state.projectMeta);
  const { uploadedVideoURL, uploadedVideoBlobURL } = useSelector(
    (state) => state.video
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedAIMusicDetails,
    recentAIGeneratedData,
    SSflaxTrackID,
    sonicLogoId,
  } = useSelector((state) => state.AIMusic);

  const setInitialDuration = () => {
    let min = Math.floor(projectDurationInsec / MAX_DURATION);
    let sec = projectDurationInsec % MAX_DURATION;
    if (+min <= MIN_DURATION) {
      min = "00";
    }
    if (+min >= MAX_DURATION) {
      min = "59";
    }
    if (+sec <= MIN_DURATION) {
      sec = "00";
    }
    if (+sec >= MAX_DURATION) {
      sec = "59";
    }
    document.getElementById("minutes").value =
      min.toString().padStart(2, "0") || "00";
    document.getElementById("seconds").value =
      sec?.toString()?.split(".")?.[0]?.padStart(2, "0") || "00";
  };

  useEffect(() => {
    setTimeout(() => {
      if (
        isOpen &&
        document.getElementById("minutes")?.id &&
        document.getElementById("seconds")?.id
      ) {
        setInitialDuration();
      }
    }, 150);
  }, [isOpen]);

  const generateProjectLength = async (values, setSubmitting) => {
    let newProjectDurationInsec =
      values?.duration?.minutes * MAX_DURATION + values?.duration?.seconds;
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
    console.log(
      "projectDuration",
      projectDuration,
      projectDuration?.toFixed(1)
    );
    console.log(
      "selectedTrackDuration",
      selectedTrackDuration,
      selectedTrackDuration?.toFixed(1)
    );
    console.log(
      "projectDuration == selectedTrackDuration",
      projectDuration == selectedTrackDuration
    );
    if (
      !selectedAIMusicDetails?.cue_id ||
      !!selectedAIMusicDetails?.custom_stems?.cue_logo?.[0]?.effect_id ||
      projectDuration == selectedTrackDuration ||
      values?.isSameAsVideoLength === "true"
    ) {
      dispatch(
        SET_LOADING_STATUS({ loaderStatus: true, loaderProgressPercent: -1 })
      );
      let projectMeta = {
        duration: +newProjectDurationInsec || +projectDurationInsec,
        projectName: values?.projectName,
        description: values?.projectDescription,
      };
      updateProjectMeta({
        projectID,
        projectMeta,
        onSuccess: () => {
          showNotification("SUCCESS", "Project length updated succesfully!");
          dispatch(
            SET_PROJECT_META({
              projectDurationInsec:
                +newProjectDurationInsec || +projectDurationInsec,
              projectName: values?.projectName,
              projectDescription: values?.projectDescription,
            })
          );
          dispatch(RESET_LOADING_STATUS());
          setSubmitting(false);
          onClose();
        },
        onError: () => {
          dispatch(RESET_LOADING_STATUS());
          setSubmitting(false);
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
      onSuccess: (response) => generateCueID(response.data.task_id, values),
      onError: () => {
        dispatch(RESET_LOADING_STATUS());
      },
    });
    setSubmitting(false);
  };

  const onGenerateCueSuccess = async (response, values) => {
    let newProjectDurationInsec =
      values?.duration?.minutes * MAX_DURATION + values?.duration?.seconds;

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

  const generateCueID = (taskID, values) => {
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
      onSuccess: (res) => onGenerateCueSuccess(res, values),
      onError: () => {
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  return (
    <>
      {/* <ButtonWrapper
        onClick={onOpen}
        style={{ width: "fit-content", padding: "0 35px" }}
      >
        Edit Project Length
      </ButtonWrapper> */}
      <button className="edit_project_meta_btn" onClick={onOpen}>
        <div className="edit_project_meta">
          <span className="projectName">{projectName}</span>
          <span className="projectDuration">
            {formatTime(projectDurationInsec)}
          </span>
        </div>
        <div className="edit_project_meta_icon">
          <EditIcon />
        </div>
      </button>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title="Update length of the project"
      >
        <div className="project_modal_container">
          <Formik
            initialValues={{
              projectName: projectName,
              projectDescription: projectDescription,
              isSameAsVideoLength:
                !!uploadedVideoURL || !!uploadedVideoBlobURL ? "true" : "false",
              duration: {
                minutes: Math.floor(projectDurationInsec / MAX_DURATION),
                seconds: projectDurationInsec % MAX_DURATION,
              },
            }}
            onSubmit={(values, { setSubmitting }) => {
              generateProjectLength(values, setSubmitting);
            }}
            validationSchema={Yup.object().shape({
              projectName: Yup.string().required("Required"),
              isSameAsVideoLength: Yup.string().required("Required"),
            })}
          >
            {(props) => {
              const {
                values,
                dirty,
                isValid,
                isSubmitting,
                touched,
                errors,
                handleChange,
                handleSubmit,
                setFieldValue,
              } = props;
              return (
                <form onSubmit={handleSubmit}>
                  <div className="project_modal__duration_container">
                    <div>
                      <Field
                        label="Project Name *"
                        id="projectSettings_projectName"
                        placeholder="Enter your project name"
                        autoFocus
                        name="projectName"
                        type="text"
                        component={InputWrapper}
                        value={values.projectName}
                      />
                    </div>
                    <div className="project_length_container">
                      <SonicInputLabel>Length of the project *</SonicInputLabel>
                      <div className="Form_radio_container">
                        <div className="main_duration_radio_container">
                          <Field
                            name="isSameAsVideoLength"
                            type="radio"
                            id="projectSettings_radio_false"
                            value="false"
                            disabled={
                              !!uploadedVideoURL || !!uploadedVideoBlobURL
                            }
                            component={RadioWrapper}
                            allowHtmlLabel={true}
                            label={
                              <DurationCounter
                                disabled={
                                  !!uploadedVideoURL || !!uploadedVideoBlobURL
                                }
                                setFieldValue={setFieldValue}
                                values={values}
                              />
                            }
                          />
                        </div>
                        <Field
                          name="isSameAsVideoLength"
                          type="radio"
                          value="true"
                          component={RadioWrapper}
                          disabled={
                            !(!!uploadedVideoURL || !!uploadedVideoBlobURL)
                          }
                          label="Use video length"
                          id="projectSettings_radio_true"
                          onChange={(e) => {
                            setFieldValue("duration", {
                              minutes: MIN_DURATION,
                              seconds: MIN_DURATION,
                            });
                            document.getElementById("minutes").value = "00";
                            document.getElementById("seconds").value = "00";
                            handleChange(e);
                          }}
                        />
                      </div>
                      {errors.isSameAsVideoLength &&
                        touched.isSameAsVideoLength && (
                          <SonicInputError style={{ marginTop: "5px" }}>
                            {errors.isSameAsVideoLength}
                          </SonicInputError>
                        )}
                    </div>
                    <div>
                      <Field
                        label="Description"
                        id="projectSettings_Description"
                        name="projectDescription"
                        type="text"
                        placeholder="Describe your project..."
                        component={TextAreaWrapper}
                        value={values.projectDescription}
                      />
                    </div>
                  </div>
                  <div className="project_modal_btn_container">
                    <ButtonWrapper onClick={onClose}>Cancel</ButtonWrapper>
                    <ButtonWrapper
                      variant="filled"
                      type="submit"
                      disabled={
                        // isSubmitting ||
                        // !isValid ||
                        // !dirty
                        // ||
                        // !(values.duration.minutes || values.duration.seconds) ||
                        // values?.duration?.minutes * MAX_DURATION +
                        //   values?.duration?.seconds ===
                        //   projectDurationInsec
                        isSubmitting ||
                        // !isValid ||
                        // !(values.projectName && values.isSameAsVideoLength) ||
                        !dirty
                        // ||
                        // (values.isSameAsVideoLength === "false" &&
                        //   !(values.duration.minutes || values.duration.seconds))
                      }
                    >
                      Save
                    </ButtonWrapper>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </ModalWrapper>
    </>
  );
}
