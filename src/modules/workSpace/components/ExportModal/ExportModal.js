import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import { ReactComponent as EditIcon } from "../../../../static/common/edit.svg";
import { ReactComponent as CheckRoundedIcon } from "../../../../static/common/checkRounded.svg";
import { ReactComponent as CloseRoundedIcon } from "../../../../static/common/closeRounded.svg";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import CustomToolTip from "../../../../common/components/customToolTip/CustomToolTip";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { useConfig } from "../../../../customHooks/useConfig";
import getExportOptions from "../../helperFunctions/getExportOptions";
import getExportRequestObj from "../../helperFunctions/getExportRequestObj";
import "./ExportModal.css";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import { ReactComponent as Info } from "../../../../static/voice/info.svg";
import { round } from "lodash";
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import { useParams } from "react-router-dom";
import getCSUserMeta from "../../../../utils/getCSUserMeta";

const ExportModal = ({
  isOpen,
  onOpen,
  onClose,
  isOpenExportModalBtnDisabled,
  openCSTOSSTransferModal,
  flagToCallExportApi,
  flagHandlerToCallExportApi,
}) => {
  const [exportOptions, setExportOptions] = useState(null);
  const [fileFormatOptions, setFileFormatOptions] = useState(null);
  const [exportselected, setexportselected] = useState("");
  const [formatselected, setformatselected] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const [confirmation, setConfirmation] = useState(false);
  const { config } = useConfig();
  const { uploadedVideoURL, tXStatus, tXsplit, tXfilePath, tXId } = useSelector(
    (state) => state.video
  );
  const { selectedAIMusicDetails } = useSelector((state) => state.AIMusic);
  const { stabilityMP3TracksArr } = useSelector(
    (state) => state.AIMusicStability
  );
  const { TTSTimelineVoicesMP3, selectedVoices } = useSelector(
    (state) => state.voices
  );
  const { currentUseThisTrack } = useSelector(
    (state) => state.AITrackStability
  );
  const { projectName, projectID, projectDurationInsec, projectDescription } =
    useSelector((state) => state.projectMeta);
  const [projectNameState, setProjectNameState] = useState(projectName);
  const [projectDescState, setProjectDescState] = useState(projectDescription);
  const [isProjectNameEditable, setIsProjectNameEditable] = useState(false);
  const [isProjectDescEditable, setIsProjectDescEditable] = useState(false);
  const [filePathForStability, setFilePathForStability] = useState("");
  const dispatch = useDispatch();
  const projectNameInputRef = useRef(null);
  const projectDescInputRef = useRef(null);
  const { cue_id } = useParams();
  const { brandMeta } = getCSUserMeta();

  const matchedFiles = stabilityMP3TracksArr?.flat().filter(
    (item) =>
      item
        .replace(/\.mp3$/i, "")
        .split("_")
        .pop()
        .replace(/stability$/i, "") === (cue_id || currentUseThisTrack)
  );

  const getFileNameAndConcat = (fileName) => {
    axiosCSPrivateInstance
      .get(`stability/GetMp3FilePAth/${projectID}`)
      .then((response) => {
        console.log("fileName", fileName);
        if (!fileName) return;
        let makeProperURL = response.data + fileName;
        console.log("response", response);
        console.log("makeProperURL", makeProperURL);
        setFilePathForStability(makeProperURL);
      })
      .catch((error) => {
        // return error
        console.log("error", error);
        setFilePathForStability("");
      });
  };

  useEffect(() => {
    if (brandMeta?.aiMusicProvider == "stability" && !!cue_id) {
      getFileNameAndConcat(matchedFiles[0]);
    }
  }, [isOpen]);

  const getFilteredExportOptions = () => {
    return getExportOptions({
      label: exportselected?.label,
      uploadedVideoURL: uploadedVideoURL,
      isVoicesFound: TTSTimelineVoicesMP3?.length > 0,
      isVoiceFromVideo:
        tXStatus === "completed" && tXsplit === "0" && !!tXfilePath,
      isAIMusicFound: !!selectedAIMusicDetails?.cue_id || !!matchedFiles[0],
      isMusicFromVideo:
        tXStatus === "completed" && tXsplit === "1" && !!tXfilePath,
      aiMusicProvider: brandMeta?.aiMusicProvider,
    });
  };

  useEffect(() => {
    let filteredOption = getFilteredExportOptions();
    setExportOptions(filteredOption);
    setexportselected(filteredOption[0]);
  }, [
    uploadedVideoURL,
    TTSTimelineVoicesMP3?.length,
    selectedAIMusicDetails?.cue_id,
    matchedFiles[0],
    tXfilePath,
  ]);

  useEffect(() => {
    if (exportselected?.label) {
      let filteredOption = getFilteredExportOptions();
      setExportOptions(filteredOption);
      console.log("file format ", exportselected.fileFormat, filteredOption);
      setFileFormatOptions(exportselected.fileFormat);
      setformatselected(exportselected?.fileFormat?.[0]);
    }
  }, [exportselected, tXfilePath]);

  useEffect(() => {
    if (!!flagToCallExportApi) {
      exportAndDownloadFile();
      flagHandlerToCallExportApi();
    }
  }, [flagToCallExportApi]);

  const exportAndDownloadFile = async () => {
    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: null,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    setProcessPercent(0);
    onClose();
    setIsProjectNameEditable(false);
    setProjectNameState(projectName);
    setIsProjectDescEditable(false);
    setProjectDescState(projectDescription);
    setIsLoading(true);
    let requestObj = await getExportRequestObj({
      exportLabel: exportselected?.label,
      formatselected,
      config,
      projectID,
      projectDurationInsec,
      uploadedVideoURL,
      selectedAIMusicDetails:
        brandMeta?.aiMusicProvider == "stability"
          ? { cue_audio_file_url: filePathForStability }
          : selectedAIMusicDetails,
      TTSTimelineVoicesMP3,
      selectedVoices,
      tXfilePath,
      tXsplit,
    });

    console.log("requestObj", requestObj?.mp3ffmpeg_Command);

    axiosCSPrivateInstance
      .post(
        "/exportFile/export",
        requestObj,
        exportselected?.label === "Script" ? { responseType: "blob" } : {}
      )
      .then((res) => {
        if (exportselected?.label === "Script") {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${projectName}_script.pdf`);
          document.body.appendChild(link);
          link.click();
          setIsLoading(false);
          showNotification("SUCCESS", "Script exported succesfully!");
          return;
        }
        axiosCSPrivateInstance(
          `/video/output?fileType=${res?.data?.fileType}&fileName=${res.data?.fileName}`,
          {
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProcessPercent(percentage);
            },
          }
        )
          .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response?.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", res?.data?.fileName);
            document.body.appendChild(link);
            link.click();
            showNotification("SUCCESS", "Media exported succesfully!");
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.log("Error testFFMPGEcall", err);
        setIsLoading(false);
      });
  };

  const updateProjectName = (editedInput) => {
    if (!projectNameState) return;
    let projectMeta = {
      projectName: projectNameState,
      description: projectDescState,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        showNotification(
          "SUCCESS",
          `Project ${editedInput} updated succesfully!`
        );
        dispatch(
          SET_PROJECT_META({
            projectName: projectNameState,
            projectDescription: projectDescState,
          })
        );
        setIsProjectNameEditable(false);
        setIsProjectDescEditable(false);
      },
    });
  };

  useEffect(() => {
    if (isProjectNameEditable) {
      projectNameInputRef.current.focus();
    }
    if (isProjectDescEditable) {
      projectDescInputRef.current.focus();
    }
  }, [isProjectNameEditable, isProjectDescEditable]);

  return (
    <>
      {isLoading && (
        <CustomLoader
          processPercent={processPercent}
          appendLoaderText={"Exporting now!"}
        />
      )}
      <ButtonWrapper
        disabled={isOpenExportModalBtnDisabled}
        style={{ width: "fit-content", padding: "0 35px" }}
        onClick={onOpen}
        variant="filled"
      >
        Export
      </ButtonWrapper>
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
        className="export_modal_dialog"
      >
        <div className="export_container">
          <div className="export-dialog">
            <div className="header">
              <h1 className="title">{projectName}</h1>
              <div className="description">{projectDescription}</div>
              <div className="exportTimestamp">{projectDurationInsec}</div>
            </div>

            <div className="section">
              <h2 className="section-title">Asset to Export</h2>
              <div className="asset-grid">
                {exportOptions?.map((option, index) => (
                  <div
                    key={"Export_option" + option?.label}
                    className={`format_style ${
                      exportselected?.label == option?.label
                        ? "format_style_active"
                        : ""
                    }`}
                    onClick={() => {
                      setexportselected(option);
                      setformatselected("");
                    }}
                  >
                    <div className="asset-option">
                      <div className="asset-icon final-mix-icon">
                        {option?.icon}
                      </div>
                      <p className="asset-label">{option?.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2 className="section-title">File Format</h2>
              <div className="format-options">
                {fileFormatOptions?.map((option, index) => (
                  <ButtonWrapper
                    key={"Format_option" + option}
                    onClick={() => setformatselected(option)}
                    variant="outlined" // keep outlined for base styling
                    className={`format-option ${
                      formatselected === option ? "selected" : ""
                    }`}
                    style={{ width: "100px" }}
                  >
                    {option}
                  </ButtonWrapper>
                ))}
              </div>
            </div>
            <div className="export_wrpper-sect">
              {exportselected?.label === "Music Only" &&
              (selectedAIMusicDetails?.cue_id ||
                brandMeta?.aiMusicProvider === "stability") &&
              config?.modules?.CS_TO_SS_AI_TRACK_TRANSFER ? (
                <div className="transfer-option">
                  <div>
                    <CheckboxWrapper
                      checked={confirmation}
                      id="confirmationCheckbox"
                      onChange={(e) => {
                        setConfirmation(e?.target?.checked);
                      }}
                    />
                  </div>
                  <label
                    className="checkbox-label"
                    htmlFor="confirmationCheckbox"
                  >
                    Request to transfer my track to Sonic Hub
                  </label>
                  <CustomToolTip
                    title={
                      <p className="transfer_title">
                        By doing this, the track will be available in Sonic
                        Space for all the users to listen, download, and
                        creatively incorporate this track into any brand
                        material.
                      </p>
                    }
                    placement="top"
                  >
                    <IconWrapper icon="Info" />
                  </CustomToolTip>
                  <div></div>
                </div>
              ) : (
                <div className="transfer-option"></div>
              )}
              <div className="button-group">
                <ButtonWrapper
                  variant="outlined"
                  className="button button-cancel"
                  onClick={() => {
                    onClose();
                    setIsProjectNameEditable(false);
                    setProjectNameState(projectName);
                    setIsProjectDescEditable(false);
                    setProjectDescState(projectDescription);
                  }}
                >
                  Back
                </ButtonWrapper>
                <ButtonWrapper
                  variant="filled"
                  onClick={() => {
                    if (confirmation) {
                      openCSTOSSTransferModal();
                      setConfirmation(false);
                    } else {
                      exportAndDownloadFile();
                    }
                  }}
                  className="button button-export"
                >
                  Export
                </ButtonWrapper>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default ExportModal;
