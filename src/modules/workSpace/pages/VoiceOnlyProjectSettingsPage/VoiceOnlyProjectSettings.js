import React from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceOnlyProjectSettings.css";
import Layout from "../../../../common/components/layout/Layout";
import NavStrings from "../../../../routes/constants/NavStrings";
import { useSelector, useDispatch } from "react-redux";
import {
  RESET_PROJECT_META,
  SET_PROJECT_META,
} from "../../redux/projectMetaSlice";
import { RESET_VIDEO_META, SET_VIDEO_META } from "../../redux/videoSlice";
import { RESET_VOICE_META } from "../../redux/voicesSlice";
import { RESET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
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
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";

const VoiceOnlyProjectSettings = () => {
  const navigate = useNavigate();
  const { activeWSTab } = useSelector((state) => state.projectMeta);

  const dispatch = useDispatch();

  const CreateProject = async (values, setSubmitting) => {
    let projectDurationInsec = 30;
    let projectMeta = {
      projectName: values.projectName,
      description: values.projectDescription,
      duration: projectDurationInsec,
    };
    createProject({
      projectMeta,
      onSuccess: (res) => {
        onCrateProjectSuccess(res, projectDurationInsec, values);
        setSubmitting(false);
      },
      onError: (err) => {
        console.log("Error Creating Project", err);
        setSubmitting(false);
      },
    });
  };

  const onCrateProjectSuccess = (res, projectDurationInsec, values) => {
    const selectedActiveWSTab = activeWSTab;
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
    if (values.isSameAsVideoLength === "true") {
      dispatch(
        SET_VIDEO_META({
          videoNavigationTo: getWorkSpacePath(res.data.projectId, null),
        })
      );
      navigate(NavStrings.UPLOAD_VIDEO, { replace: true });
    } else {
      navigate(getWorkSpacePath(res.data.projectId, null), {
        replace: true,
      });
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
              isSameAsVideoLength: "false",
            }}
            onSubmit={(values, { setSubmitting }) => {
              // console.log("values", values);
              CreateProject(values, setSubmitting);
            }}
            validationSchema={Yup.object().shape({
              projectName: Yup.string().required("Required"),
            })}
          >
            {(props) => {
              const { values, dirty, isValid, isSubmitting, handleSubmit } =
                props;
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
                    <SonicInputLabel>Video</SonicInputLabel>
                    <div className="Form_radio_container">
                      <Field
                        name="isSameAsVideoLength"
                        type="radio"
                        value="false"
                        component={RadioWrapper}
                        label="No video"
                        id="projectSettings_radio_false"
                      />
                      <Field
                        name="isSameAsVideoLength"
                        type="radio"
                        value="true"
                        component={RadioWrapper}
                        label="Use video"
                        id="projectSettings_radio_true"
                      />
                    </div>
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
                      disabled={isSubmitting || !isValid || !dirty}
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

export default VoiceOnlyProjectSettings;
