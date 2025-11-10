import React, { useState } from "react";
import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";
import UploadIcon from "../../../../static/common/upload.svg";
import { getDroppedOrSelectedFiles } from "html5-file-selector";
import "./VideoUploader.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import ReactPlayer from "react-player";
import "./VideoUploader.css";
import { useConfig } from "../../../../customHooks/useConfig";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import b64toBlob from "../../../../utils/b64toBlob";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
// import { RESET_TTS_TIMELINE_VOICES } from "../../redux/voicesSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import uploadProjectVideo from "../../services/videoDB/uploadProjectVideo";
import saveCoverImage from "../../services/videoDB/saveCoverImage";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";

//https://react-dropzone-uploader.js.org/docs/props
//https://react-dropzone-uploader.js.org/docs/examples#custom-input-directory-drag-and-drop
//https://codesandbox.io/s/generate-video-thumbnails-forked-5v6wj3

export const VideoUploader = (props) => {
  const [vidSource, setVidSource] = useState();
  const [FileSource, SetFileSource] = useState();
  let navigate = useNavigate();

  const { videoNavigationTo, coverImage } = useSelector((state) => state.video);
  const { config } = useConfig();
  const { projectID } = useSelector((state) => state.projectMeta);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [projectDuration, setProjectDuration] = useState(0);

  const UploadVideoToServer = () => {
    setLoading(true);
    var formdata = new FormData();
    formdata.append("file", FileSource);
    formdata.append("projectID", +projectID);
    const configMeta = {
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProcessPercent(percentage);
      },
    };
    uploadProjectVideo({
      formdata,
      configMeta,
      onSuccess: onVideoUploadSuccess,
      onError: (err) => {
        console.log("Error Uploading Video", err);
        setLoading(false);
        // dispatch(RESET_TTS_TIMELINE_VOICES());
        navigate(videoNavigationTo);
      },
    });
  };

  const onVideoUploadSuccess = (res) => {
    let projectMeta = {
      duration: +projectDuration,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        const url = window.URL.createObjectURL(new Blob([FileSource]));
        dispatch(
          SET_VIDEO_META({
            uploadedVideoURL: res.data.FileName || "",
            uploadedVideoBlobURL: url || "",
            isVideoUploaded: true,
          })
        );
        dispatch(
          SET_PROJECT_META({
            projectDurationInsec: +projectDuration,
          })
        );
        let thumbnailsArr = [];
        generateVideoThumbnails(FileSource, 20).then((thumbnails) => {
          if (!coverImage && thumbnails?.length > 0) {
            let thumbnailToSave = thumbnails?.[Math.round(20 / 2)];
            saveCoverImage({
              projectID,
              base64ImageUrl: thumbnailToSave,
            });
          }
          thumbnails.forEach((thumbnail) => {
            const parts = thumbnail.split(";base64,");
            // Hold the content type
            const contentType = parts[0].split(":")[1];
            // Decode Base64 string
            const b64Data = parts[1];
            var blob = b64toBlob(b64Data, contentType);
            var blobUrl = URL.createObjectURL(blob);
            thumbnailsArr.push(blobUrl);
          });
          dispatch(
            SET_VIDEO_META({
              thumbnails: thumbnailsArr.slice(0, 20),
            })
          );
        });
        setLoading(false);
        // dispatch(RESET_TTS_TIMELINE_VOICES());
        setTimeout(() => {
          navigate(videoNavigationTo);
        }, 500);
      },
    });
  };

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    // let unsupportedTypeArr = ["video/quicktime"];
    let unsupportedTypeArr = [];
    if (unsupportedTypeArr.includes(file.type)) {
      showNotification("ERROR", "Unsupported format!");
      return;
    }
    const url = URL.createObjectURL(file);
    setVidSource(url);
    if (status === "done") {
      let durationValue = roundUpToDecimal(meta?.duration);
      if (durationValue > 0) {
        setProjectDuration(durationValue);
      }
    }
  };

  const InputComp = ({ accept, onFiles, files, getFilesFromEvent }) => {
    return (
      <div className="uploaderBlock">
        <p className="title">Drag and Drop</p>
        <p className="sub_title">Choose a video to start your project</p>
        <img
          width={33}
          height={33}
          style={{ margin: "30px 20px" }}
          src={UploadIcon}
          alt="Upload"
        />
        <label className="uploadBtn boldFamily">
          Upload File
          <input
            style={{ display: "none" }}
            type="file"
            accept="video/x-matroska,video/*"
            multiple
            onChange={(e) => {
              getFilesFromEvent(e).then((chosenFiles) => {
                onFiles(chosenFiles);
              });
            }}
          />
        </label>
      </div>
    );
  };

  const getFilesFromEvent = (e) => {
    return new Promise((resolve) => {
      getDroppedOrSelectedFiles(e).then((chosenFiles) => {
        resolve(chosenFiles.map((f) => f.fileObject));
        SetFileSource(chosenFiles[0].fileObject);
      });
    });
  };

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    allFiles.forEach((f) => f.remove());
  };

  const uploaderStyle = {
    dropzone: { backgroundColor: "#cfc", borderWidth: 0 },
  };

  return (
    <>
      {loading && (
        <CustomLoader
          processPercent={processPercent}
          appendLoaderText={"Uploading video now!"}
        />
      )}

      {vidSource ? (
        <>
          <ReactPlayer
            width="350px"
            height="225px"
            url={vidSource}
            muted={true}
            style={{
              margin: "50px 50px 35px",
              border: `1px solid ${"var(--color-primary)"}`,
              padding: "5px",
            }}
            controls
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload noplaybackrate noremoteplayback",
                  disablePictureInPicture: true,
                },
              },
            }}
          />
          <div className="video_uploader_btn_container">
            <ButtonWrapper
              onClick={() => {
                navigate(-1);
              }}
            >
              Back
            </ButtonWrapper>
            <ButtonWrapper variant="filled" onClick={UploadVideoToServer}>
              Next
            </ButtonWrapper>
          </div>
        </>
      ) : (
        <>
          <Dropzone
            //getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            accept="video/x-matroska,video/*"
            multiple={false}
            maxFiles={1}
            InputComponent={InputComp}
            SubmitButtonComponent={null}
            PreviewComponent={null}
            getFilesFromEvent={getFilesFromEvent}
            //inputContent={(files, extra) => (extra.reject ? 'Video files only' : 'Drag Files')}
            classNames={uploaderStyle}
            styles={{
              dropzoneReject: { borderColor: "red", backgroundColor: "#DAA" },
              inputLabel: (files, extra) =>
                extra.reject ? { color: "red" } : {},
            }}
          />
          <div className="video_uploader_btn_container">
            <ButtonWrapper
              onClick={() => {
                navigate(-1);
              }}
            >
              Back
            </ButtonWrapper>
          </div>
        </>
      )}
    </>
  );
};
