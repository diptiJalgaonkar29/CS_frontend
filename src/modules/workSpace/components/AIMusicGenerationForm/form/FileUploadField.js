import "./FileUploadField.css";

import { useField, useFormikContext } from "formik";
import { ReactComponent as AddIcon } from "../../../../../static/common/add_thin.svg";
import { ReactComponent as CloseIcon } from "../../../../../static/common/close_thin.svg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SET_AI_MUSIC_META } from "../../../redux/AIMusicSlice";
import { SET_VIDEO_META } from "../../../redux/videoSlice";
import removeProjectVideo from "../../../services/videoDB/removeProjectVideo";
import getAIAnalysisType from "../../../helperFunctions/getAIAnalysisType";
import axiosCSPrivateInstance from "../../../../../axios/axiosCSPrivateInstance";
import NavStrings from "../../../../../routes/constants/NavStrings";
import ModalWrapper from "../../../../../branding/componentWrapper/ModalWrapper";
import ButtonWrapper from "../../../../../branding/componentWrapper/ButtonWrapper";
import { useRef, useState } from "react";
import getCSUserMeta from "../../../../../utils/getCSUserMeta";

function DeleteModal({ open, close, details }) {
  let dispatch = useDispatch()
  console.log('details', details)

  const {
    aiMusicGeneratorAnalysisDetails
  } = useSelector((state) => state.AIMusic);


  const removeVideo = (projectID, id) => {
    removeProjectVideo({ projectID });
    dispatch(SET_VIDEO_META({ uploadedVideoFile: null }));
    close()
  }

  const removeAIAnalysisData = (analysisId) => {
    if (!analysisId) return console.log("analysisId not found : ", analysisId);
    // call api to remove analysis by analysisId and add this in on success
    axiosCSPrivateInstance
      ?.delete(`ai_analysis/deleteByAiID/${analysisId}`)
      .then(() => {
        const newAiMusicGeneratorAnalysisDetails =
          aiMusicGeneratorAnalysisDetails.filter(
            (item) => item.id !== analysisId
          );
        // const AIMusic
        dispatch(
          SET_AI_MUSIC_META({
            aiMusicGeneratorAnalysisDetails: newAiMusicGeneratorAnalysisDetails,
          })
        );
        close()
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <ModalWrapper
      isOpen={open}
      onClose={close}
      className="ai_Music_genrator_3_dialog"
    >
      <div>
        {
          details?.deleteKey == "brief" ? (
            <span>
              You are about to remove your brief, are you sure you want to proceed?
            </span>
          ) : (
            <>
              <h2>Are you sure you want to delete this video?</h2>
              <span>Deleting the video won’t affect your project’s current length. To adjust the project duration, click<br /> the Edit icon at the top right. The track will automatically adapt to the new length.</span>
            </>
          )
        }
        <div className="action_btn">
          <ButtonWrapper
            // style={{ width: "250px" }}
            onClick={() => close()}
          >
            Cancel
          </ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            // style={{ width: "250px" }}
            onClick={() => {
              if (details?.deleteKey === "brief") {
                removeAIAnalysisData(details?.analaysisID);
              } else {
                removeVideo(details?.projectID);

                const videoAnalysisId = aiMusicGeneratorAnalysisDetails?.find(
                  (item) => getAIAnalysisType(+item?.mediatype) === "video"
                )?.id;

                if (videoAnalysisId) {
                  removeAIAnalysisData(videoAnalysisId);
                }
              }
            }}
          >
            Delete
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper >
  )
}

export default function FileUploadField({ name, label, accept, values, called }) {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [shareData, setShareData] = useState({})
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { brandMeta } = getCSUserMeta();
  const fileInputRef = useRef(null);
  const {
    aiMusicGeneratorProgress,
    aiMusicGeneratorAnalysisDetails
  } = useSelector((state) => state.AIMusic);
  const { uploadedVideoURL, uploadedVideoBlobURL, coverImage, tXId } =
    useSelector((state) => state.video);
  const {
    projectID,
  } = useSelector((state) => state.projectMeta);

  const { briefFile, videoFile, yourPrompt, analyzeOptions } = values || {};
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFieldValue(name, file);
    setFieldTouched(name, true); // manually mark as touched
  };

  console.log('aiMusicGeneratorAnalysisDetails', aiMusicGeneratorAnalysisDetails)

  const getIsDisabled = (called) => {
    // Rule 1: Prompt exists → disable both video & brief
    if (yourPrompt) {
      return called === "1" || called === "2" || called === "prompt";
    }

    // Rule 2: Video exists → disable brief (called "2")
    if (videoFile || uploadedVideoURL || uploadedVideoBlobURL) {
      return called === "2";
    }

    // Rule 3: Brief exists → disable video (called "1")
    if (briefFile) {
      return called === "1";
    }

    // Rule 4: Process (analysis details) check
    const processedVideo = aiMusicGeneratorAnalysisDetails?.some(
      (item) => String(item.mediatype) === "1" && item.status === "completed"
    );
    const processedBrief = aiMusicGeneratorAnalysisDetails?.some(
      (item) => String(item.mediatype) === "3" && item.status === "completed"
    );

    if (processedVideo) {
      return called === "2" || !!yourPrompt; // disable brief + prompt
    }

    if (processedBrief) {
      return called === "1" || !!yourPrompt; // disable video + prompt
    }

    return false; // default
  };


  const isDisabled = getIsDisabled(called);

  const handleRemoveFile = (e, name, id) => {
    e.preventDefault(); // prevent button from submitting form
    setFieldValue(name, null);
    setFieldTouched(name, true);

    if (!!id || uploadedVideoBlobURL || uploadedVideoURL) {
      setOpen(true)
    }

    if (name === "videoFile") {
      setShareData({ projectID: projectID, analaysisID: id, deleteKey: "video" });
    } else if (name === "briefFile") {
      setShareData({ analaysisID: id, deleteKey: "brief" });
    }

    // If removing videoFile or briefFile, clear analyzeOptions
    if (name === "videoFile" || name === "briefFile" || name === "yourPrompt") {
      setFieldValue("analyzeOptions", []);
    }
  };

  const matchedItem = aiMusicGeneratorAnalysisDetails?.find(
    (item) =>
      (name === "briefFile" &&
        String(item.mediatype) === "3" &&
        item.status === "completed") ||
      (name === "videoFile" &&
        String(item.mediatype) === "1" &&
        item.status === "completed")
  );
  const findBy = aiMusicGeneratorAnalysisDetails?.find(
    (item) =>
      (field.name === "briefFile" && String(item.mediatype) === "3" && item.status === "completed") ||
      (field.name === "videoFile" && String(item.mediatype) === "1" && item.status === "completed")
  );

  console.log('findBy', findBy)
  console.log('field.name', field.name)

  const handleRedirect = () => {
    navigate(NavStrings.UPLOAD_VIDEO, { state: { videoUpload: "video" } })
  }

  return (
    <>
      <div className="file-field-container" style={{
        pointerEvents: aiMusicGeneratorProgress?.id ? "none" : undefined,
        opacity: aiMusicGeneratorProgress?.id ? 0.5 : 1,
      }}>
        <label htmlFor={name} className="file-upload-button">
          {
            matchedItem ? (
              <span className="file-label">{matchedItem.fileName || field?.value?.name}</span>
            ) : (
              <span className="file-label" onClick={called == "1" ? handleRedirect : null}>{field?.value?.name || label}</span>
            )
          }
          <button
            type="button"
            className="file-upload-button-icon"
            onClick={(e) => {
              e.stopPropagation(); // prevent label from hijacking click

              if (findBy || field.value || matchedItem) {
                handleRemoveFile(e, name, findBy?.id);
              } else {
                if (called == "1") {
                  handleRedirect()
                } else {
                  fileInputRef.current?.click();
                }
              }
            }}
            disabled={aiMusicGeneratorProgress?.id}
          >
            {(findBy || field.value) ? <CloseIcon /> : <AddIcon />}
          </button>
          {
            called == "1" ? null :
              <input
                id={name}
                type="file"
                accept={accept}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={aiMusicGeneratorProgress?.id}
                className="hidden-file-input"
              />
          }
        </label>
        {
          meta.touched && meta.error && (
            <div className="field-error">{meta.error}</div>
          )
        }
      </div >
      <DeleteModal open={open} close={() => setOpen(false)} details={shareData} />
    </>
  );
}
