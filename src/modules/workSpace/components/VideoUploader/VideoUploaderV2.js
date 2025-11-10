import { useState } from "react";
import "react-dropzone-uploader/dist/styles.css";
import "./VideoUploader.css";
import { useLocation, useNavigate } from "react-router-dom";
import "./VideoUploader.css";
import NavStrings from "../../../../routes/constants/NavStrings";
import "./VideoUploaderV2.css";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useDispatch, useSelector } from "react-redux";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import VideoInputWrapper from "../../../../branding/componentWrapper/VideoInputWrapper";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";

//https://react-dropzone-uploader.js.org/docs/props
//https://react-dropzone-uploader.js.org/docs/examples#custom-input-directory-drag-and-drop
//https://codesandbox.io/s/generate-video-thumbnails-forked-5v6wj3

export const VideoUploaderV2 = () => {
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  const { projectID, activeWSTab } = useSelector((state) => state.projectMeta);
  const { cueID, aiMusicGeneratorOption, aiMusicGenerator, flaxTrackID } =
    useSelector((state) => state.AIMusic);

  console.log("state", state);

  const onFileChange = async (file, meta) => {
    console.log("activeWSTab", activeWSTab);
    const url = URL.createObjectURL(file);
    const navData = {
      VideoURL: url,
      fileSource: file,
      meta,
    };
    setIsLoading(false);
    // if (!!flaxTrackID) {
    //   dispatch(SET_PROJECT_META({ activeWSTab: "AI Music" }));
    //   navigate(NavStrings.RETAIN_AUDIO, { state: navData });
    // } else
    if (activeWSTab === "Voice") {
      dispatch(SET_PROJECT_META({ activeWSTab: "Voice" }));
      navigate(NavStrings.RETAIN_AUDIO, { state: navData });
    } else if (activeWSTab === "AI Music") {
      dispatch(SET_PROJECT_META({ activeWSTab: "AI Music" }));
      if (state?.videoUpload === "video") {
        navigate(
          NavStrings.WORKSPACE_AI_MUSIC_GENERATOR + "/" + state.videoUpload,
          { state: navData, videoUpload: "video" }
        );
      } else {
        navigate(NavStrings.RETAIN_AUDIO, { state: navData });
      }
    }
  };

  return (
    <div className="video_upload_v2">
      {isLoading ? (
        <div className="video_upload_v2_loading_block">
          <CustomLoaderSpinner />
        </div>
      ) : (
        <>
          <VideoInputWrapper
            onChange={onFileChange}
            accept="video/x-matroska,video/*"
            multiple={false}
            maxFiles={1}
            placeholder={"Drag and Drop or Upload File"}
          />
          {/* <Dropzone
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
            // classNames={uploaderStyle}
            // styles={{
            //   dropzoneReject: { borderColor: "red", backgroundColor: "#DAA" },
            //   inputLabel: (files, extra) =>
            //     extra.reject ? { color: "red" } : {},
            // }}
          /> */}
        </>
      )}

      <div className="video_uploader_btn_container">
        <ButtonWrapper
          onClick={() => {
            // navigate(getWorkSpacePath(projectID, cueID));
            if (
              ["video"]?.includes(
                aiMusicGeneratorOption || aiMusicGenerator?.projectFlow
              )
            ) {
              navigate(NavStrings.WORKSPACE_AI_MUSIC_GENERATOR);
            } else {
              navigate(getWorkSpacePath(projectID, cueID));
            }
          }}
        >
          Back
        </ButtonWrapper>
      </div>
    </div>
  );
};
