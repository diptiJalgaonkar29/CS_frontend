import React, { useEffect, useState } from "react";
import "./SonicVideoInput.css";
import UploadIcon from "../../../../static/common/upload.svg";
// import { ReactComponent as CloseIcon } from "../../../../static/closeIcon.svg";
import Dropzone from "react-dropzone-uploader";
import { getDroppedOrSelectedFiles } from "html5-file-selector";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import showNotification from "../../../../common/helperFunctions/showNotification";

const SonicVideoInput = ({ onChange, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleChangeStatus = async ({ meta, file }, status) => {
    let unsupportedTypeArr = ["video/avi"];
    if (
      unsupportedTypeArr.includes(file.type) ||
      status === "rejected_file_type"
    ) {
      showNotification("ERROR", "Unsupported format!");
      setIsLoading(false);
      return;
    }
    await onChange(file, {
      lastModified: meta?.lastModifiedDate,
      name: meta?.name,
      size: meta?.size,
      type: meta?.type,
    });
    setIsLoading(false);
  };

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    allFiles.forEach((f) => f.remove());
  };

  const InputComp = ({ accept, onFiles, files, getFilesFromEvent }) => {
    return (
      <div className="uploaderBlock">
        <p className="title">Drag and Drop</p>
        <p className="sub_title">or</p>
        <label className="uploadBtn boldFamily">
          <img
            width={33}
            height={33}
            style={{ margin: "10px 20px 10px 12px" }}
            src={UploadIcon}
            alt="Upload"
            className="uploadImg"
          />
          Upload File
          <input
            style={{ display: "none" }}
            type="file"
            accept="video/x-matroska,video/*"
            multiple
            onChange={(e) => {
              setIsLoading(true);
              getFilesFromEvent(e).then((chosenFiles) => {
                onFiles(chosenFiles);
              });
            }}
            onError={(err) => {
              console.log("err", err);
              setIsLoading(false);
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
      });
    });
  };

  const uploaderStyle = {
    dropzone: { backgroundColor: "#cfc", borderWidth: 0 },
  };

  return (
    <React.Fragment>
      <div className="sonic_video_input_container">
        {isLoading ? (
          <div className="video_upload_v2_loading_block">
            <CustomLoaderSpinner />
          </div>
        ) : (
          <>
            <Dropzone
              //getUploadParams={getUploadParams}
              {...props}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              InputComponent={InputComp}
              SubmitButtonComponent={null}
              PreviewComponent={null}
              getFilesFromEvent={getFilesFromEvent}
              //inputContent={(files, extra) => (extra.reject ? 'Video files only' : 'Drag Files')}
              classNames={uploaderStyle}
              // styles={{
              //   dropzoneReject: { borderColor: "red", backgroundColor: "#DAA" },
              //   inputLabel: (files, extra) =>
              //     extra.reject ? { color: "red" } : {},
              // }}
            />
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default SonicVideoInput;
