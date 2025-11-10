import React from "react";
import "./UploadVideoPage.css";
import Layout from "../../../../common/components/layout/Layout";
import { VideoUploaderV2 } from "../../components/VideoUploader/VideoUploaderV2";

const UploadVideoPage = () => {
  return (
    <Layout fullWidth={true}>
      <div className="upload_video_wrapper">
        <div className="upload_video_container">
          <div className="upload_video_header">
            <p className="title boldFamily">Upload Video</p>
            <p className="sub_title">
              The length of your project will be automatically set to the length
              of the video
            </p>
          </div>
          <VideoUploaderV2 />
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideoPage;
