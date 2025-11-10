"use client";
import { useState, useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";

import TextAreaField from "../form/TextAreaField";
import CheckboxGroup from "../form/CheckboxGroup";
import FileUploadFieldStability from "../form/FileUploadFieldStability";
import ButtonWrapper from "../../../../../branding/componentWrapper/ButtonWrapper";
import SonicInputError from "../../../../../branding/sonicspace/components/InputError/SonicInputError";
import CustomLoader from "../../../../../common/components/customLoader/CustomLoader";

import { SET_AI_MUSIC_Stability_META } from "../../../redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../../redux/AITrackStabilitySlice";
import { RESET_LOADING_STATUS } from "../../../../../common/redux/loaderSlice";

import { initAIAnalysisStability } from "../../../helperFunctions/initAIAnalysisStability";
import { initVideoBreifAIAnalysisStability } from "../../../helperFunctions/initVideoBreifAIAnalysisStability";
import fileUpload from "../../../services/FileUpload/fileUpload";
import axiosCSPrivateInstance from "../../../../../axios/axiosCSPrivateInstance";

import "./StabilityMusicGenerationForm.css";

const analyzeOptions = [
  { id: "video", label: "Video" },
  { id: "brief", label: "Brief" },
  { id: "prompt", label: "Prompt" },
];

const validationSchema = Yup.object({
  yourPrompt: Yup.string(),
  videoFile: Yup.mixed(),
  briefFile: Yup.mixed(),
  analyzeOptions: Yup.array(),
});

export default function StabilityMusicGenerationForm() {
  const dispatch = useDispatch();

  const { projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const { uploadedVideoFile } = useSelector((state) => state.video);
  const { stabilityLoading, latestFiledataStability, stabilityMP3TracksArr } =
    useSelector((state) => state.AIMusicStability);
  const { stabilityArr, currentUseThisTrack } = useSelector(
    (state) => state.AITrackStability
  );

  const [fileUploadPopup, setFileUploadPopup] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    yourPrompt: "",
    videoFile: uploadedVideoFile,
    briefFile: null,
    analyzeOptions: [],
  };

  /** -------------------
   * CREATE BLOB URLS
   * ------------------*/
  const createBlobURLs = useCallback(
    async (fileNames) => {
      try {
        const requests = fileNames.map((file) =>
          axiosCSPrivateInstance.get(
            `/stability/GetMediaFile/${projectID}/${file}`,
            { responseType: "blob" }
          )
        );

        const results = await Promise.all(requests);
        const objectURLs = results.map((res) => URL.createObjectURL(res.data));

        console.log("Fetched all Stability MP3 files:", objectURLs);

        dispatch(
          SET_AI_Track_Stability_META({
            stabilityArr: [...stabilityArr, ...objectURLs],
            currentUseThisTrack,
          })
        );

        dispatch(
          SET_AI_MUSIC_Stability_META({
            stabilityMP3TracksArr: [...stabilityMP3TracksArr, ...fileNames],
            stabilityLoading: false,
          })
        );
      } catch (error) {
        console.error("Error fetching stability MP3 files:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      dispatch,
      projectID,
      stabilityArr,
      stabilityMP3TracksArr,
      currentUseThisTrack,
    ]
  );

  /** -------------------
   * PROMPT-BASED GENERATION
   * ------------------*/
  const handleAIAnalysisStability = useCallback(
    (data) => {
      setIsLoading(true);
      initAIAnalysisStability({
        data,
        projectID,
        onSuccess: createBlobURLs,
        onError: () => {
          console.error("Stability AI Music Generation Error");
          dispatch(SET_AI_MUSIC_Stability_META({ stabilityLoading: false }));
        },
        onFinally: () => setIsLoading(false),
      });
    },
    [dispatch, projectID, createBlobURLs]
  );

  /** -------------------
   * VIDEO/BRIEF ANALYSIS
   * ------------------*/
  const handleVideoBriefAIAnalysis = useCallback(
    (data) => {
      setIsLoading(true);
      initVideoBreifAIAnalysisStability({
        data,
        projectID,
        pollingDataFiles: (details) => {
          dispatch(
            SET_AI_MUSIC_Stability_META({
              stabilityMP3TracksArr,
              latestFiledataStability: details,
              stabilityLoading: true,
            })
          );
        },
        onSuccess: createBlobURLs,
        onError: () => console.error("Video/Brief AI Music Generation Error"),
        onFinally: () => {
          setIsLoading(false);
          setFileUploadPopup(false);
          dispatch(RESET_LOADING_STATUS());
        },
      });
    },
    [dispatch, projectID, stabilityMP3TracksArr, createBlobURLs]
  );

  /** -------------------
   * FILE UPLOAD HANDLER
   * ------------------*/
  const uploadFileFunction = useCallback(
    (fileObject) => {
      if (!fileObject) return console.error("Error: No file selected!");

      setFileUploadPopup(true);

      const formdata = new FormData();
      formdata.append("file", fileObject);
      formdata.append("projectId", +projectID);

      const configMeta = {
        onUploadProgress: ({ loaded, total }) =>
          setProcessPercent(Math.round((loaded * 100) / total)),
      };

      fileUpload({
        formdata,
        configMeta,
        onSuccess: (res) => {
          const fileName = res?.data;
          const fileType = fileName?.toLowerCase().endsWith(".pdf") ? 3 : 1;
          const cappedDuration =
            projectDurationInsec > 180 ? 180 : projectDurationInsec;

          const payload = {
            projectId: projectID,
            sentFileName: fileName,
            type: fileType,
            duration: cappedDuration,
            prompt: null,
          };

          handleVideoBriefAIAnalysis(payload);
        },
        onError: (error) => {
          console.error("Error Uploading File:", error);
          setFileUploadPopup(false);
          dispatch(RESET_LOADING_STATUS());
        },
      });
    },
    [dispatch, projectID, projectDurationInsec, handleVideoBriefAIAnalysis]
  );

  /** -------------------
   * FORM SUBMISSION
   * ------------------*/
  const handleSubmit = useCallback(
    (values) => {
      const { briefFile, videoFile, yourPrompt } = values;

      dispatch(
        SET_AI_MUSIC_Stability_META({
          stabilityMP3TracksArr,
          stabilityLoading: true,
        })
      );

      const data = {
        projectId: projectID,
        prompt: yourPrompt,
        duration: projectDurationInsec,
        type: 4,
      };

      if (briefFile) uploadFileFunction(briefFile);
      else if (videoFile) uploadFileFunction(videoFile);
      else handleAIAnalysisStability(data);
    },
    [
      dispatch,
      stabilityMP3TracksArr,
      projectID,
      projectDurationInsec,
      uploadFileFunction,
      handleAIAnalysisStability,
    ]
  );

  /** -------------------
   * JSX RETURN
   * ------------------*/
  return (
    <div className="MusicGenerationformContainer">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, values, errors, touched, dirty }) => (
          <Form className="musicForm">
            <TextAreaField
              name="yourPrompt"
              label="Your Prompt"
              placeholder="Describe the mood, genre, instrument, or scene — and the AI will turn it into music."
              rows={4}
              disabled={isLoading || stabilityLoading || fileUploadPopup}
            />

            <div className="attachSection">
              <p className="SonicInputLabel">Attach</p>
              <div className="fileUploads">
                <FileUploadFieldStability
                  name="videoFile"
                  label="Video"
                  accept="video/*"
                  values={values}
                  called={1}
                  prevStability={
                    latestFiledataStability?.filter(
                      (item) => item.type === 1 && !!item?.sentFileName
                    ) || null
                  }
                />
                <FileUploadFieldStability
                  name="briefFile"
                  label="Brief"
                  accept=".txt,.doc,.docx,.pdf"
                  values={values}
                  called={2}
                  prevStability={
                    latestFiledataStability?.filter(
                      (item) => item.type === 3 && !!item?.sentFileName
                    ) || null
                  }
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

            <div className="new_UI_genrateButton">
              <ButtonWrapper
                type="submit"
                variant="filled"
                disabled={
                  isSubmitting ||
                  !isValid ||
                  !dirty ||
                  !(
                    (values?.yourPrompt ||
                      values?.videoFile ||
                      values?.briefFile) &&
                    values?.analyzeOptions?.length > 0
                  )
                }
              >
                {isLoading ? "Generating..." : "Generate Tracks"}
              </ButtonWrapper>
            </div>
          </Form>
        )}
      </Formik>

      {fileUploadPopup && stabilityLoading && (
        <div className="overlay">
          <CustomLoader
            processPercent={processPercent}
            appendLoaderText="Uploading asset now!"
          />
        </div>
      )}
    </div>
  );
}
