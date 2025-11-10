import React from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./ProjectSettings.css";
import Layout from "../../../../common/components/layout/Layout";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useSelector, useDispatch } from "react-redux";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../redux/projectMetaSlice";
import { RESET_VIDEO_META, SET_VIDEO_META } from "../../redux/videoSlice";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import createProject from "../../services/projectDB/createProject";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import InputWrapper from "../../../../branding/componentWrapper/InputWrapper";
import RadioWrapper from "../../../../branding/componentWrapper/RadioWrapper";
import TextAreaWrapper from "../../../../branding/componentWrapper/TextAreaWrapper";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import DurationCounter from "../../components/DurationCounter/DurationCounter";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import getCSUserMeta from "../../../../utils/getCSUserMeta";

const ProjectSettings = ({ flaxId, isCSTrack }) => {
  const MAX_DURATION = 60;
  const MIN_DURATION = 0;
  const navigate = useNavigate();
  const { activeWSTab } = useSelector((state) => state.projectMeta);
  const { aiMusicGeneratorOption } = useSelector((state) => state.AIMusic);
  const param = useParams();
  const [searchParams] = useSearchParams();
  const AIMusicGeneratorOption = searchParams.get("option");
  const dispatch = useDispatch();
  const { brandMeta } = getCSUserMeta();

  const CreateProject = async (values, setSubmitting) => {
    let projectDurationInsec;
    if (values.isSameAsVideoLength === "false") {
      projectDurationInsec =
        values.duration.minutes * MAX_DURATION + values.duration.seconds;
    } else {
      projectDurationInsec = MAX_DURATION / 2;
    }
    let projectMeta = {
      projectName: values.projectName,
      description: values.projectDescription,
      duration: +projectDurationInsec,
      aiAnalysis: brandMeta?.aiMusicProvider === "stability" ?
        "Stability" : ["tags", "brief", "video"].includes(AIMusicGeneratorOption)
          ? AIMusicGeneratorOption
          : "Voice",
    };
    createProject({
      projectMeta,
      onSuccess: (res) => {
        onCrateProjectSuccess(res, projectDurationInsec, values);
        setSubmitting(false);
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGenerator: {
              id: null,
              status: null,
              projectFlow: ["tags", "brief", "video"].includes(
                AIMusicGeneratorOption
              )
                ? AIMusicGeneratorOption
                : "Voice",
            },
          })
        );
      },
      onError: (err) => {
        console.log("Error Creating Project", err);
        setSubmitting(false);
      },
    });
  };

  const onCrateProjectSuccess = (res, projectDurationInsec, values) => {
    const selectedActiveWSTab = activeWSTab;
    const selectedAIMusicGenratorOption = aiMusicGeneratorOption;
    dispatch(RESET_VIDEO_META());
    dispatch(RESET_VOICE_META());
    dispatch(RESET_AI_MUSIC_META());
    dispatch(RESET_PROJECT_META());
    showNotification(
      "SUCCESS",
      `${values.projectName} created succesfully!`,
      4000
    );
    dispatch(
      SET_PROJECT_META({
        projectName: values.projectName,
        projectDescription: values.projectDescription,
        projectID: res.data.projectId,
        projectDurationInsec: +projectDurationInsec,
        activeWSTab: selectedActiveWSTab,
      })
    );
    dispatch(
      SET_AI_MUSIC_META({
        aiMusicGeneratorOption: selectedAIMusicGenratorOption,
      })
    );
    if (values.isSameAsVideoLength === "true") {
      if (flaxId) {
        dispatch(
          SET_AI_MUSIC_META({
            flaxTrackID: flaxId,
            isCSTrack,
            SSflaxTrackID: flaxId || "",
          })
        );
        dispatch(SET_VIDEO_META({ videoNavigationTo: NavStrings.FLAX_TRACK }));
        if (flaxId) {
          dispatch(
            SET_VIDEO_META({ videoNavigationTo: NavStrings.FLAX_TRACK })
          );
          navigate(NavStrings.UPLOAD_VIDEO, {
            state: { flowKey: param?.flax_id ? true : false },
          });
        } else {
          navigate(NavStrings.UPLOAD_VIDEO, {
            state: { flowKey: param?.flax_id ? true : false },
          });
        }
      } else {
        if (selectedActiveWSTab === "Voice") {
          dispatch(
            SET_VIDEO_META({
              videoNavigationTo: getWorkSpacePath(res.data.projectId, null),
            })
          );
          console.log("calledFrom---117");
          navigate(NavStrings.UPLOAD_VIDEO, { replace: true });
        } else {
          // dispatch(
          //   SET_VIDEO_META({ videoNavigationTo: NavStrings.BRAND_TAGS })
          // );
          dispatch(
            SET_VIDEO_META({
              videoNavigationTo: getWorkSpacePath(res.data.projectId, null),
            })
          );
          console.log("calledFrom---122");
          navigate(NavStrings.UPLOAD_VIDEO, { replace: true });
          // navigate(NavStrings.WORKSPACE_AI_MUSIC_GENERATOR + "?option=" + AIMusicGeneratorOption, { replace: true });
        }
      }
    } else {
      if (flaxId) {
        dispatch(
          SET_AI_MUSIC_META({
            flaxTrackID: flaxId,
            isCSTrack,
            SSflaxTrackID: flaxId || "",
          })
        );
        navigate(NavStrings.FLAX_TRACK, { replace: true });
      } else {
        // if (selectedActiveWSTab === "Voice") {
        //   navigate(getWorkSpacePath(res.data.projectId, null), {
        //     replace: true,
        //   });
        // } else {
        //   navigate(
        //     NavStrings.WORKSPACE_AI_MUSIC_GENERATOR +
        //       "?option=" +
        //       AIMusicGeneratorOption,
        //     { replace: true }
        //   );
        // }
        navigate(getWorkSpacePath(res.data.projectId, null), {
          replace: true,
        });
      }
    }
  };

  return (
    <Layout fullWidth={true}>
      <div className="project_setting_wrapper">
        <div className="project_setting_container">
          <Formik
            initialValues={{
              projectName: "",
              projectDescription: "",
              isSameAsVideoLength: "",
              duration: {
                minutes: MIN_DURATION,
                seconds: MIN_DURATION,
              },
            }}
            onSubmit={(values, { setSubmitting }) => {
              setTimeout(() => {
                CreateProject(values, setSubmitting);
              }, 500);
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
                      {AIMusicGeneratorOption !== "video" && (
                        <div className="main_duration_radio_container">
                          <Field
                            name="isSameAsVideoLength"
                            type="radio"
                            id="projectSettings_radio_false"
                            value="false"
                            component={RadioWrapper}
                            allowHtmlLabel={true}
                            label={
                              <DurationCounter
                                setFieldValue={setFieldValue}
                                values={values}
                              />
                            }
                          />
                        </div>
                      )}
                      <Field
                        name="isSameAsVideoLength"
                        type="radio"
                        value="true"
                        component={RadioWrapper}
                        label="Use video length"
                        id="projectSettings_radio_true"
                        onChange={(e) => {
                          setFieldValue("duration", {
                            minutes: MIN_DURATION,
                            seconds: MIN_DURATION,
                          });
                          AIMusicGeneratorOption !== "video" &&
                            (() => {
                              document.getElementById("minutes").value = "00";
                              document.getElementById("seconds").value = "00";
                            })();
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
                  <div className="btn_container">
                    <ButtonWrapper
                      variant="outlined"
                      onClick={() => {
                        navigate(-1);
                      }}
                    >
                      Cancel
                    </ButtonWrapper>
                    <ButtonWrapper
                      variant="filled"
                      type="submit"
                      disabled={
                        isSubmitting ||
                        // !isValid ||
                        !(values.projectName && values.isSameAsVideoLength) ||
                        !dirty ||
                        (values.isSameAsVideoLength === "false" &&
                          !(values.duration.minutes || values.duration.seconds))
                      }
                    >
                      Next
                    </ButtonWrapper>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectSettings;
