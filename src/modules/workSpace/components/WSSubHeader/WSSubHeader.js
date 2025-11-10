import React, { useState } from "react";
import { ReactComponent as SoundEdit } from "../../../../static/voice/sound_edit.svg";
import { ReactComponent as Left_arrow } from "../../../../static/common/New_Left_Arrow.svg";
import { ReactComponent as Add } from "../../../../static/common/add_border.svg";
import { ReactComponent as VideoIcon } from "../../../../static/common/video2.svg";
import { useNavigate, useParams } from "react-router-dom";
import NavStrings from "../../../../routes/constants/NavStrings";
import "./WSSubHeader.css";
import { SET_VOICE_META } from "../../redux/voicesSlice";
import { useDispatch, useSelector } from "react-redux";
import BrandTagsModal from "../BrandTagsModal/BrandTagsModal";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import {
  checkAIMusicCreateAccess,
  checkAIMusicEditAccess,
  checkAIMusicVariantAccess,
} from "../../../../utils/checkAppAccess";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import { SET_VIDEO_META } from "../../redux/videoSlice";
import UploadVideoPage from "../../pages/uploadVideoPage/UploadVideoPage";
import { useConfig } from "../../../../customHooks/useConfig";
import ExportModal from "../ExportModal/ExportModal";
import CSTOSSTransferModal from "../CSTOSSTransferModal/CSTOSSTransferModal";
import CSTOSSTransferSuccessModal from "../CSTOSSTransferSuccessModal/CSTOSSTransferSuccessModal";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import CStoSSTransfer from "../../services/export/CStoSSTransfer";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import getSuperBrandName from "./../../../../utils/getSuperBrandName";
import { brandConstants } from "./../../../../utils/brandConstants";

const WSSubHeader = ({ type = "" }) => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { TTSTimelineVoicesMP3 } = useSelector((state) => state.voices);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [flagToCallExportApi, setFlagToCallExportApi] = useState(false);
  const { activeWSTab, projectID, projectName } = useSelector(
    (state) => state.projectMeta
  );
  const { currentUseThisTrack } = useSelector(
    (state) => state.AITrackStability
  );
  const {
    recentAIGeneratedData,
    selectedAIMusicDetails,
    cueID,
    isFreshAITracksListPage,
    flaxTrackID,
    aiMusicGenerator,
  } = useSelector((state) => state.AIMusic);
  const {
    uploadedVideoURL,
    uploadedVideoBlobURL,
    tXStatus,
    tXsplit,
    tXfilePath,
    tXId,
  } = useSelector((state) => state.video);
  const [loading, setloading] = useState(false);
  const [isRequestTrasferModalOpen, setIsRequestTrasferModalOpen] =
    useState(false);
  const [
    isRequestTrasferSuccessModalOpen,
    setIsRequestTrasferSuccessModalOpen,
  ] = useState(false);
  const [CStoSSTransferLoading, setCStoSSTransferLoading] = useState(false);
  const { config } = useConfig();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { brandMeta } = getCSUserMeta();
  let { cue_id } = useParams();

  console.log("cue_id", cue_id);

  let headerData;

  function isValidURL(url) {
    try {
      new URL(url); // will throw if invalid
      return true;
    } catch (_) {
      return false;
    }
  }

  if (type === "BACK_TO_DASHBOARD") {
    headerData = [
      {
        Icon: Left_arrow,
        label: "Back to work space",
        onClick: () => {
          navigate(getWorkSpacePath(projectID, cueID));
        },
        enable: true,
      },
    ].filter((data) => !!data && data.enable);
  } else {
    headerData =
      activeWSTab === "Voice" && tXsplit !== "0"
        ? [
            {
              Icon: Add,
              label: "Add Voice",
              onClick: () => {
                dispatch(
                  SET_VOICE_META({
                    isVoiceListModalOpen: true,
                    voiceListModalAction: "ADD_VOICE",
                  })
                );
              },
              enable: true,
              disabled: false,
            },
            {
              Icon: SoundEdit,
              label: "Edit Pronunciation",
              onClick: () => {
                dispatch(SET_VOICE_META({ isDictModalOpen: true }));
              },
              enable: true,
              disabled: false,
            },
            {
              Icon: VideoIcon,
              label: "Add Video",
              onClick: () => {
                if (!!uploadedVideoBlobURL || !!uploadedVideoURL) return;
                dispatch(
                  SET_VIDEO_META({
                    videoNavigationTo: getWorkSpacePath(projectID, cueID),
                  })
                );
                navigate(NavStrings.UPLOAD_VIDEO);
                // setIsAddVideoModalOpen(true);
              },
              enable: true,
              disabled: !!uploadedVideoBlobURL || !!uploadedVideoURL,
            },
          ]
        : [
            brandMeta?.aiMusicProvider == "stability"
              ? {
                  Icon: Left_arrow,
                  label: "Back to music selection",
                  onClick: () => navigate(NavStrings.RECENT_AI_MUSIC),
                  enable: !!cue_id,
                }
              : recentAIGeneratedData?.length > 1 && !isFreshAITracksListPage
              ? {
                  Icon: Left_arrow,
                  label: !cueID
                    ? "AI Music Generator"
                    : "Back to music selection",
                  onClick: () => {
                    navigate(NavStrings.RECENT_AI_MUSIC);
                  },
                  enable:
                    checkAIMusicVariantAccess() ||
                    checkAIMusicEditAccess() ||
                    checkAIMusicCreateAccess(),
                  disabled: false,
                }
              : null,
            {
              Icon: VideoIcon,
              label: "Add Video",
              onClick: () => {
                if (!!uploadedVideoBlobURL || !!uploadedVideoURL) return;
                dispatch(
                  SET_VIDEO_META({
                    videoNavigationTo: getWorkSpacePath(projectID, cueID),
                  })
                );
                navigate(NavStrings.UPLOAD_VIDEO);
                // setIsAddVideoModalOpen(true);
              },
              enable: !!(uploadedVideoBlobURL || uploadedVideoURL)
                ? false
                : true,
              disabled: !!uploadedVideoBlobURL || !!uploadedVideoURL,
            },
          ].filter((data) => !!data && data.enable);
  }

  // if (headerData.length === 0 || !uploadedVideoURL) return <div className="WS_sub_header_filler" />;
  if (headerData.length === 0) return <div className="WS_sub_header_filler" />;

  console.log("currentUseThisTrack", currentUseThisTrack);
  console.log("cue_id", cue_id);

  let isOpenExportModalDisabled =
    TTSTimelineVoicesMP3?.length === 0 &&
    !selectedAIMusicDetails?.cue_id &&
    (!currentUseThisTrack || !cue_id) &&
    !tXfilePath;

  return (
    <>
      {loading && <CustomLoader />}
      <div className="AI_tab_header_menu_wrapper">
        <div className="AI_tab_header_menu_container AI_tab_header_menu_wrapper_left">
          {activeWSTab !== "Voice" &&
          (!!uploadedVideoBlobURL || !!uploadedVideoURL) &&
          !cueID
            ? headerData?.length > 0 &&
              headerData?.map(({ Icon, enable, disabled, label, onClick }) => {
                return (
                  <div
                    key={label}
                    style={{ display: enable ? "flex" : "none" }}
                    className={`AI_tab_header_menu_item_container ${
                      disabled
                        ? "disabled_AI_tab_header_menu_item_container"
                        : ""
                    }`}
                    onClick={onClick}
                  >
                    <Icon className="AI_tab_header_menu_icons" />
                    <p className={`AI_tab_menu_title`}>{label}</p>
                  </div>
                );
              })
            : headerData?.length > 0 &&
              headerData?.map(({ Icon, enable, disabled, label, onClick }) => {
                return (
                  <div
                    key={label}
                    style={{ display: enable ? "flex" : "none" }}
                    className={`AI_tab_header_menu_item_container ${
                      disabled
                        ? "disabled_AI_tab_header_menu_item_container"
                        : ""
                    }`}
                    onClick={onClick}
                  >
                    <Icon className="AI_tab_header_menu_icons" />
                    <p className={`AI_tab_menu_title`}>{label}</p>
                  </div>
                );
              })}
        </div>
        {console.log("config?.modules?.SHOW_EXPORT_BTN", config?.modules)}
        <div className="AI_tab_header_menu_wrapper_right">
          {console.log("##config:", config)}
          {/* {config?.SHOW_EXPORT_BTN && ( */}
          {getSuperBrandName() === brandConstants.WPP
            ? config?.SHOW_EXPORT_BTN
            : config?.modules?.SHOW_EXPORT_BTN && (
                <>
                  <ExportModal
                    isOpenExportModalBtnDisabled={isOpenExportModalDisabled}
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    onOpen={() => setIsExportModalOpen(true)}
                    openCSTOSSTransferModal={() => {
                      setIsRequestTrasferModalOpen(true);
                      setIsExportModalOpen(false);
                    }}
                    flagHandlerToCallExportApi={() =>
                      setFlagToCallExportApi(true)
                    }
                    flagToCallExportApi={flagToCallExportApi}
                  />{" "}
                  {config?.modules?.CS_TO_SS_AI_TRACK_TRANSFER && (
                    <>
                      <CSTOSSTransferModal
                        trackName={
                          selectedAIMusicDetails?.label?.split("##")?.[0] ||
                          selectedAIMusicDetails?.name ||
                          projectName
                        }
                        isOpen={isRequestTrasferModalOpen}
                        onClose={() => {
                          setIsRequestTrasferModalOpen(false);
                          setIsRequestTrasferSuccessModalOpen(false);
                        }}
                        onTransfer={() => {
                          setCStoSSTransferLoading(true);
                          dispatch(
                            SET_AI_MUSIC_META({
                              playedCueID: null,
                              playedInstrument: null,
                              playedSonicLogo: null,
                            })
                          );
                          dispatch(
                            SET_PROJECT_META({ isTimelinePlaying: false })
                          );
                          const filteredStemData = Object.keys(
                            selectedAIMusicDetails
                          )
                            .filter((key) => {
                              return (
                                key.startsWith("stem_") &&
                                key.endsWith("_audio_file_url") &&
                                !key.includes("percussion")
                              );
                            })
                            ?.map((key) => {
                              let keyName = key
                                .slice(5)
                                .replace("_audio_file_url", "");
                              return {
                                label: keyName,
                                value: selectedAIMusicDetails[key],
                              };
                            });
                          let AITrackMeta = {
                            projectId: projectID,
                            cueId: selectedAIMusicDetails?.cue_id,
                            trackName:
                              selectedAIMusicDetails?.label?.split("##")?.[0] ||
                              selectedAIMusicDetails?.name ||
                              projectName,
                            mp3: selectedAIMusicDetails?.cue_audio_file_url,
                            videoMp3:
                              tXStatus === "completed" &&
                              tXsplit === "1" &&
                              !!tXfilePath
                                ? tXfilePath
                                : null,
                            stem: filteredStemData,
                          };
                          CStoSSTransfer({
                            AITrackMeta,
                            onSuccess: (res) => {
                              setCStoSSTransferLoading(false);
                              setIsRequestTrasferModalOpen(false);
                              setIsRequestTrasferSuccessModalOpen(true);
                            },
                            onError: () => {
                              setFlagToCallExportApi(false);
                              setCStoSSTransferLoading(false);
                            },
                          });
                          setFlagToCallExportApi(true);
                        }}
                      />
                      {CStoSSTransferLoading && <CustomLoader />}
                      <CSTOSSTransferSuccessModal
                        isOpen={isRequestTrasferSuccessModalOpen}
                        onClose={() => {
                          setIsRequestTrasferModalOpen(false);
                          setIsRequestTrasferSuccessModalOpen(false);
                          setIsExportModalOpen(false);
                        }}
                      />
                    </>
                  )}
                </>
              )}
        </div>
      </div>

      <ModalWrapper
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
      >
        {/* {!loading && ( */}
        <BrandTagsModal
          type="FRESH_TRACKS"
          closeModal={setIsVariantModalOpen}
          tagsToShow={flaxTrackID ? "FLAX_TRACK_TAGS" : "BRAND_TAGS"}
          setLoading={setloading}
        />
        {/* )} */}
      </ModalWrapper>
      {/* <ModalWrapper
        isOpen={isAddVideoModalOpen}
        onClose={() => setIsAddVideoModalOpen(false)}
      >
        <UploadVideoPage />
      </ModalWrapper> */}
    </>
  );
};

export default WSSubHeader;
