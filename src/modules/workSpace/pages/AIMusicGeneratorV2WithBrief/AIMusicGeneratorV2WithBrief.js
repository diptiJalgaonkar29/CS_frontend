import { useEffect, useState } from "react";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { Field, Formik } from "formik";
import "./AIMusicGeneratorV2WithBrief.css";
import TextAreaWrapper from "../../../../branding/componentWrapper/TextAreaWrapper";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import FileInputWrapper from "../../../../branding/componentWrapper/FileInputWrapper";
import { RESET_LOADING_STATUS } from "../../../../common/redux/loaderSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import SonicInputLabel from "../../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import aiAnalysisApiRequest from "../../services/AiAnalysisApiRequest/aiAnalysisApiRequest";
import fileUpload from "../../services/FileUpload/fileUpload";
import * as Yup from "yup";
import NavStrings from "../../../../routes/constants/NavStrings";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import { FormattedMessage } from "react-intl";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { getAIAnalysisStatus } from "../../helperFunctions/getAIAnalysisStatus";
import { initAIAnalysis } from "../../helperFunctions/initAIAnalysis";
import { useConfig } from "../../../../customHooks/useConfig";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";

const SUPPORTED_FORMATS = ["application/pdf"];

const validationSchema = Yup.object()
  .shape({
    prompt: Yup.string().trim(),
    mediaFile: Yup.mixed()
      .nullable()
      .test("fileFormat", "Unsupported Format", (value) => {
        if (!value) return true;
        return SUPPORTED_FORMATS.some((format) =>
          value?.type?.startsWith(format)
        );
      }),
  })
  .test("at-least-one", "Either Prompt or Media File is required", (values) => {
    if (!values) return false;
    return !!values.prompt?.trim() || !!values.mediaFile;
  });

export default function AIMusicGeneratorV2WithBrief() {
  const navigate = useNavigate();
  let dispatch = useDispatch();
  const { projectID } = useSelector((state) => state.projectMeta);
  const { aiMusicGeneratorProgress } = useSelector((state) => state.AIMusic);
  const [pollingModal, setPollingModal] = useState(false);
  const [fileUploadPopup, setFileUploadPopup] = useState(false);
  const { config, jsonConfig } = useConfig();
  const [processPercent, setProcessPercent] = useState(0);

  const stopPolling = (interval) => {
    clearInterval(interval);
    // dispatch(RESET_LOADING_STATUS());
  };
  console.log("aiMusicGeneratorProgress", aiMusicGeneratorProgress);

  useEffect(() => {
    if (!aiMusicGeneratorProgress?.id) return;
    getAIAnalysisStatus({
      analysisId: aiMusicGeneratorProgress?.id,
      stopPollingRequest: () => {
        stopPolling(interval);
      },
      navigate,
      setPollingModal,
      config,
      jsonConfig,
    });
    const interval = setInterval(() => {
      getAIAnalysisStatus({
        analysisId: aiMusicGeneratorProgress?.id,
        stopPollingRequest: () => {
          stopPolling(interval);
        },
        navigate,
        setPollingModal,
        config,
        jsonConfig,
      });
    }, 10000); // Retry every 5 seconds

    return () => stopPolling(interval); // Cleanup on unmount
  }, [aiMusicGeneratorProgress?.id]);

  const aiAnalysisRequest = (data) => {
    initAIAnalysis({
      data,
      onSuccess: (response) => {
        setFileUploadPopup(false);
        if (!pollingModal) setPollingModal(true);
      },
      onError: (error) => {
        setPollingModal(false);
        dispatch(RESET_LOADING_STATUS());
      },
    });
  };

  const handleSubmit = (values) => {
    setPollingModal(true);
    let data = {
      projectID: projectID,
      fileName: values?.prompt ? null : values?.mediaFile?.name,
      mediatype: values?.prompt ? 4 : 3,
      inputText: values?.prompt,
    };

    if (values?.mediaFile) {
      uploadFileFunction(values.mediaFile);
    } else {
      aiAnalysisRequest(data);
    }
  };

  const uploadFileFunction = (fileObject) => {
    if (!fileObject) {
      console.error("Error: No file selected!");
      return;
    }

    setFileUploadPopup(true);

    var formdata = new FormData();
    formdata.append("file", fileObject);
    formdata.append("projectId", +projectID);

    const configMeta = {
      onUploadProgress: ({ loaded, total }) =>
        setProcessPercent(Math.round((loaded * 100) / total)),
    };

    fileUpload({
      formdata,
      configMeta,
      onSuccess: (fileResponse) => {
        let data = {
          projectID: projectID,
          fileName: fileResponse?.data,
          mediatype: 3,
          inputText: fileResponse?.data,
        };
        aiAnalysisRequest(data);
      },
      onError: (error) => {
        console.log("Error Uploading Video", error);
        setFileUploadPopup(false);
        dispatch(RESET_LOADING_STATUS());
        setPollingModal(false);
      },
    });
  };

  return (
    <div className="brief_form_container">
      <Formik
        initialValues={{
          prompt: "",
          mediaFile: null,
        }}
        onSubmit={(values, { setSubmitting }) => {
          console.log("values", values);
          setTimeout(() => {
            handleSubmit(values);
            // uploadFileFunction(values)
          }, 500);
        }}
        validationSchema={validationSchema}
      >
        {(props) => {
          const {
            dirty,
            isValid,
            resetForm,
            isSubmitting,
            errors,
            values,
            handleSubmit,
            setFieldValue,
          } = props;
          return (
            <form onSubmit={handleSubmit}>
              <SonicInputLabel
                htmlFor="brief_upload_btn_ref"
                style={{ marginBottom: "10px" }}
              >
                {/* Upload Brief */}
              </SonicInputLabel>
              <Field
                id="brief_upload_btn_ref"
                name="mediaFile"
                label="Upload Brief"
                type="file"
                className="brief_upload_btn"
                accept=".pdf"
                placeholder={`Upload Brief`}
                component={FileInputWrapper}
                disabled={values?.prompt ? true : false}
                // disabled={true}

                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  setFieldValue("mediaFile", file);
                  setFieldValue("prompt", ""); // Clear prompt when mediaFile is selected
                }}
              />
              {errors.mediaFile && (
                <SonicInputError>{errors.mediaFile}</SonicInputError>
              )}
              <p className="brief_form_divider">- Or -</p>
              <Field
                name="prompt"
                type="text"
                label="Prompt"
                placeholder="e.g. A melancholic yet hopeful piano piece with ambient textures, subtle strings, and a soft ticking sound to evoke the passage of time.The composition should feel intimate and cinematic, gradually building in intensity while maintaining a sense of introspection and emotional depth."
                component={TextAreaWrapper}
                rows="5"
                disabled={values?.mediaFile ? true : false}
                onChange={(e) => {
                  setFieldValue("prompt", e.target.value);
                  setFieldValue("mediaFile", null); // Clear mediaFile when prompt is entered
                }}
              />

              <div className="brief_form_btn_container">
                <ButtonWrapper
                  type="submit"
                  variant="filled"
                  disabled={isSubmitting || !isValid || !dirty}
                >
                  Generate
                </ButtonWrapper>
              </div>
            </form>
          );
        }}
      </Formik>
      <ModalWrapper isOpen={pollingModal} className="pollingModal-dialog">
        {fileUploadPopup ? (
          <CustomLoader
            processPercent={processPercent}
            appendLoaderText={"Uploading brief now!"}
          />
        ) : (
          <>
            <p className="pollingModal_header">
              <FormattedMessage
                id={"workspace.AIMusicGenerator.ProcessingText"}
              />
            </p>
            <div className="pollingModal_btn">
              <ButtonWrapper
                variant="filled"
                onClick={() => navigate(NavStrings?.PROJECTS)}
              >
                Okay
              </ButtonWrapper>
            </div>
          </>
        )}
      </ModalWrapper>
    </div>
  );
}
