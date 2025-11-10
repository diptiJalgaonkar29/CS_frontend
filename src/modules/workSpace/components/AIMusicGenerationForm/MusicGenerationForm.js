import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextAreaField from "./form/TextAreaField";
import FileUploadField from "./form/FileUploadField";
import CheckboxGroup from "./form/CheckboxGroup";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import "./MusicGenerationForm.css";
import SonicInputError from "../../../../branding/sonicspace/components/InputError/SonicInputError";
import { useDispatch, useSelector } from "react-redux";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import { useCallback, useEffect, useState } from "react";
import { initAIAnalysis } from "../../helperFunctions/initAIAnalysis";
import { RESET_LOADING_STATUS } from "../../../../common/redux/loaderSlice";
import fileUpload from "../../services/FileUpload/fileUpload";
import { useNavigate, useParams } from "react-router-dom";
import { getAIAnalysisStatus } from "../../helperFunctions/getAIAnalysisStatus";
import { useConfig } from "../../../../customHooks/useConfig";


const analyzeOptions = [
  // { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "brief", label: "Brief" },
  { id: "prompt", label: "Prompt" },
];

const validationSchema = Yup.object({
  yourPrompt: Yup.string(),
  // negativePrompt: Yup.string(),
  videoFile: Yup.mixed(),
  briefFile: Yup.mixed(),
  analyzeOptions: Yup.array(),
});

export default function MusicGenerationForm() {
  let dispatch = useDispatch();
  const { projectID } = useSelector((state) => state.projectMeta);
  const { aiMusicGeneratorProgress, aiMusicGeneratorAnalysisDetails } = useSelector((state) => state.AIMusic);
  const { uploadedVideoFile } = useSelector((state) => state.video);
  const [pollingModal, setPollingModal] = useState(false);
  const [fileUploadPopup, setFileUploadPopup] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);

  const matchedItem = aiMusicGeneratorAnalysisDetails?.find(
    (item) =>
    (String(item.mediatype) === "4" &&
      item.status === "completed")
  );

  const aiAnalysisRequest = (data) => {
    initAIAnalysis({
      data,
      onSuccess: () => {
        setFileUploadPopup(false);
        if (!pollingModal) setPollingModal(true);
      },
      onError: () => {
        setPollingModal(false);
        dispatch(RESET_LOADING_STATUS());
      },
    });
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

   const getFileType = f => {
  const ext = f?.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return 3;
    case 'mp4': case 'mov': case 'avi': case 'mkv': case 'webm': case 'flv': case 'wmv': return 1;
    case 'mp3': case 'wav': case 'aac': case 'ogg': case 'flac': case 'm4a': return 2;
    default: return 4;
  }
};

    const configMeta = {
      onUploadProgress: ({ loaded, total }) =>
        setProcessPercent(Math.round((loaded * 100) / total)),
    };

    fileUpload({
      formdata,
      configMeta,
      onSuccess: (fileResponse) => {
        console.log("fileupload done", fileResponse?.data);
        let mediaTypeToSend = getFileType(fileResponse?.data);

        let data = {
          projectID: projectID,
          fileName: fileResponse?.data,
          mediatype: mediaTypeToSend,
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

  const handleApiRequest = async (values) => {
    const { briefFile, videoFile, yourPrompt, analyzeOptions } = values;

    let data = {
      projectID: projectID,
      fileName: briefFile ? briefFile?.name : videoFile ? videoFile?.name : null,
      mediatype: yourPrompt ? 4 : briefFile ? 3 : 1,
      inputText: yourPrompt,
    };

    if (briefFile) {
      uploadFileFunction(briefFile);
    } else if (videoFile) {
      uploadFileFunction(videoFile);
    } else {
      aiAnalysisRequest(data);
    }
  };

  return (
    <div className="MusicGenerationformContainer">
      <Formik
        initialValues={{
          yourPrompt: "",
          // negativePrompt: "",
          videoFile: uploadedVideoFile,
          briefFile: null,
          analyzeOptions: [],
        }}
        validationSchema={validationSchema}
        onSubmit={handleApiRequest}
      >
        {({ isSubmitting, isValid, values, errors, touched, dirty }) => (
          <Form className="musicForm">
            <TextAreaField
              name="yourPrompt"
              label="Your Prompt"
              placeholder="Describe the mood, genre, instrument, or scene — and the AI will turn it into music."
              rows={4}
              disabled={aiMusicGeneratorProgress?.id}
            />
            <TextAreaField
              name="negativePrompt"
              label="Negative Prompt"
              placeholder="Tell the AI what to avoid in your track."
              rows={1}
            />
            <div className="attachSection">
              <p className="SonicInputLabel">Attach</p>
              <div className="fileUploads">
                <FileUploadField
                  name="videoFile"
                  label="Video"
                  accept="video/*"
                  values={values}
                  called="1"
                />
                <FileUploadField
                  name="briefFile"
                  label="Brief"
                  accept=".txt,.doc,.docx,.pdf"
                  values={values}
                  called="2"
                />
              </div>
            </div>
            <div>
              <CheckboxGroup
                name="analyzeOptions"
                label="Analyze"
                options={analyzeOptions}
              />
              {touched?.analyzeOptions && errors?.analyzeOptions && (
                <SonicInputError style={{ marginTop: "10px" }}>
                  {errors?.analyzeOptions}
                </SonicInputError>
              )}
            </div>
            <ButtonWrapper
              type="submit"
              disabled={values?.analyzeOptions?.length == 0 || isSubmitting || !isValid || aiMusicGeneratorProgress?.id}
              variant="filled"
            >
              {isSubmitting || aiMusicGeneratorProgress?.id
                ? "Generating..."
                : "Generate Tracks"}
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
      <ModalWrapper isOpen={fileUploadPopup} className="pollingModal-dialog">
        <CustomLoader
          processPercent={processPercent}
          appendLoaderText={"Uploading asset now!"}
        />
      </ModalWrapper>
    </div >
  );
}
