import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import "./AIMusicTab.css";
import { ReactComponent as Arrow } from "../../../../static/common/downArrow.svg";
import AITrackCard from "../AITrackCard/AITrackCard";
import { useNavigate } from "react-router-dom";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import DropBlock from "../DropBlock/DropBlock";
import {
  RESET_AI_MUSIC_META,
  SET_AI_MUSIC_META,
} from "../../redux/AIMusicSlice";
import BrandTagsModal from "../BrandTagsModal/BrandTagsModal";
import regenerateTrack from "../../services/TuneyAIMusic/regenerateTrack";
import InstrumentsPanel from "../InstrumentsPanel/InstrumentsPanel";
import getTrackDetailsByCueID from "../../services/TuneyAIMusic/getTrackDetailsByCueID";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import showNotification from "../../../../common/helperFunctions/showNotification";
import DashboardTrackVariantList from "../DashboardTrackVariantList/DashboardTrackVariantList";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import roundUpToDecimal from "../../../../utils/roundUpToDecimal";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import {
  checkAIMusicEditAccess,
  checkAIMusicVariantAccess,
} from "../../../../utils/checkAppAccess";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import SonicLogoPanel from "../SonicLogoPanel/SonicLogoPanel";
import { last, isEqual, reduce } from "lodash";
import getAIMusicEndingOption from "../../helperFunctions/getAIMusicEndingOption";
import getAIMusicActionPerformed from "../../helperFunctions/getAIMusicActionPerformed";
import NavStrings from "../../../../routes/constants/NavStrings";
import divideDurationBySections from "../../../../utils/divideDurationBySections";
import { AIMusicActions } from "../../constants/AIMusicActions";

const getSuccessMessage = (action) => {
  let successMessage;
  switch (action) {
    case AIMusicActions.ADD_DROP_AND_ENDING:
      successMessage = "Drop and ending updated succesfully!";
      break;
    case AIMusicActions.ADD_DROP:
      successMessage = "Drop added succesfully!";
      break;
    case AIMusicActions.ADD_ENDING:
      successMessage = "Ending updated succesfully!";
      break;
    case AIMusicActions.INSTRUMENT_UPDATE:
      successMessage = "Instruments updated succesfully!";
      break;
    case AIMusicActions.ADD_DROP_AND_INSTRUMENT_UPDATE:
      successMessage = "Drop and instrument updated succesfully!";
      break;
    default:
      successMessage = "";
  }
  return successMessage;
};

export default function AIMusicTab({ cueID }) {
  const [loading, setloading] = useState(false);
  const {
    selectedAIMusicDetails,
    recentAIGeneratedData,
    avoidLengthRegeneration,
    previousCueID,
    redoCueID,
    AITrackVariations,
    SSflaxTrackID,
    dropPosition,
    endingOption,
    isDrop,
    flaxTrackID,
    sonicLogoId,
    regenerateLengthAPICallCount,
    stemVolume,
    isDropSliderVisible,
  } = useSelector((state) => state.AIMusic);
  const [variantLoading, setvariantLoading] = useState(false);
  const [variantsDetails, setVariantsDetails] = useState(AITrackVariations);
  const { projectID, projectDurationInsec } = useSelector(
    (state) => state.projectMeta
  );
  const [processStatus, setProcessStatus] = useState(false);
  const [processPercent, setProcessPercent] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uploadedVideoURL } = useSelector((state) => state.video);
  const [trackedit, setTrackedit] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [AITrackNameAndDescription, setAITrackNameAndDescription] =
    useState(null);
  const [newVariants, setNewVariants] = useState(null);
  const MAX_REGEN_CUE_API_CALL_COUNT = 5;

  useEffect(() => {
    return () => {
      if (regenerateLengthAPICallCount !== 0) {
        dispatch(
          SET_AI_MUSIC_META({
            regenerateLengthAPICallCount: 0,
          })
        );
      }
    };
  }, []);

  useEffect(() => {
    if (selectedAIMusicDetails?.cue_id !== cueID) {
      getAITrackDetailsByCueID(cueID);
    } else {
      RegenCue(
        selectedAIMusicDetails?.settings?.length,
        selectedAIMusicDetails?.cue_id,
        selectedAIMusicDetails?.custom_stems?.cue_logo?.[0]?.effect_id || null
      );
    }
  }, [cueID]);

  useEffect(() => {
    if (!variantsDetails || variantsDetails?.length === 0) {
      if (AITrackVariations !== null) {
        dispatch(SET_AI_MUSIC_META({ AITrackVariations: null }));
      }
      return;
    }
    dispatch(SET_AI_MUSIC_META({ AITrackVariations: variantsDetails }));
    let videoContainerElement = document.querySelector(
      ".video_layout_container .video_container"
    );
    if (videoContainerElement) {
      videoContainerElement.style.cssText = `
      position: relative;
      top: 0;
    `;
    }

    return () => {
      if (videoContainerElement) {
        videoContainerElement.style.cssText = `
        position: sticky;
        top: 50px;
      `;
      }
    };
  }, [variantsDetails?.length]);

  useEffect(() => {
    if (!AITrackNameAndDescription || !newVariants) return;
    let newVariantsArr = [...(newVariants || [])];
    let AIMusicMeta;
    if (newVariantsArr?.length !== 0) {
      AIMusicMeta = newVariantsArr?.map((data, index) => {
        newVariantsArr[index].label =
          AITrackNameAndDescription?.[index]?.name || `${data?.name}`;
        newVariantsArr[index].desc =
          AITrackNameAndDescription?.[index]?.description || "-";
        return {
          label: AITrackNameAndDescription?.[index]?.name || `${data?.name}`,
          value: data?.cue_id,
          desc: AITrackNameAndDescription?.[index]?.description || "-",
          parentCueId: data?.parent_cue_id,
          action: AIMusicActions.VARIANT,
        };
      });
    }
    // console.log("newVariantsArr", newVariantsArr);
    let filteredVariantsObj = newVariantsArr.map((variant) => {
      const {
        bpm = "",
        key = "",
        image_url = "",
        peaks = [],
        ...restData
      } = variant;
      return restData;
    });
    setVariantsDetails((prev) => [...filteredVariantsObj, ...(prev ?? [])]);
    setProcessStatus(false);
    setvariantLoading(false);
    setAITrackNameAndDescription(null);
    setNewVariants(null);
    let AIMusicTrackDetails = filteredVariantsObj?.map((trackMeta) => ({
      mood: trackMeta?.settings?.mood,
      genre: trackMeta?.settings?.genre,
      tempo: trackMeta?.settings?.tempo,
      length: trackMeta?.settings?.length,
      name: trackMeta?.label,
      description: trackMeta?.desc,
      cue_id: trackMeta?.cue_id,
      parent_cue_id: trackMeta?.parent_cue_id,
      sonic_logo_id: trackMeta?.custom_stems?.cue_logo?.[0]?.effect_id || null,
      flax_id:
        (trackMeta?.sections?.[0]?.flax_tracks?.[0] === "None"
          ? ""
          : trackMeta?.sections?.[0]?.flax_tracks?.[0] || "") || SSflaxTrackID,
      action: AIMusicActions.VARIANT,
      project_id: projectID,
    }));

    addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        variantCueIds: JSON.stringify(AIMusicMeta),
      },
      recentAIGeneratedData,
    });
  }, [AITrackNameAndDescription?.length, newVariants?.length]);

  const getAITrackDetailsByCueID = (cueID) => {
    setloading(true);
    getTrackDetailsByCueID({
      cueID,
      onSuccess: onGetTrackDetailsByCueIDSuccess,
      onError: () => {
        console.log("error in getting track details");
        showNotification(
          "ERROR",
          "Error while loading track. Please try another combination.",
          5000
        );
        dispatch(RESET_AI_MUSIC_META());
        navigate(getWorkSpacePath(projectID, null));
        setloading(false);
      },
    });
  };

  const onGetTrackDetailsByCueIDSuccess = async (response) => {
    onGetRecentGeneratedCueIdsSuccess(response?.data);
  };

  const onGetRecentGeneratedCueIdsSuccess = (AITrackMeta) => {
    let selectedTrack = recentAIGeneratedData?.find(
      (trackMeta) => trackMeta?.value === AITrackMeta?.cue_id
    );
    const {
      bpm = "",
      key = "",
      image_url = "",
      peaks = [],
      ...restData
    } = AITrackMeta;

    dispatch(
      SET_AI_MUSIC_META({
        trackDuration: restData?.settings?.length,
        dropPosition:
          restData?.cue_parameters?.transition?.time ||
          restData?.settings?.length * 0.25,
        stemVolume: restData?.volumes?.[0],
        isDrop: Boolean(restData?.cue_parameters?.transition?.time),
        endingOption: getAIMusicEndingOption(last(restData?.sections)?.ending)
          ?.value,
        selectedAIMusicDetails: { ...restData, ...selectedTrack },
        sonicLogoId: restData?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flaxTrackID:
          restData?.sections?.[0]?.flax_tracks?.[0] === "None"
            ? ""
            : restData?.sections?.[0]?.flax_tracks?.[0] || "",
        cueID: restData?.cue_id,
        playedInstrument: null,
        playedCueID: null,
        playedSonicLogo: null,
      })
    );
    RegenCue(
      restData?.settings?.length,
      restData?.cue_id,
      restData?.custom_stems?.cue_logo?.[0]?.effect_id || null
    );
  };

  // console.log("projectDurationInsec", projectDurationInsec);
  const RegenCue = (trackDuration, cueID, sonicLogoId) => {
    console.log("regenerateLengthAPICallCount", regenerateLengthAPICallCount);
    let projectDuration = roundUpToDecimal(projectDurationInsec, 1);
    let selectedTrackDuration = roundUpToDecimal(trackDuration, 1);
    console.log("sonicLogoId", sonicLogoId);
    console.log("projectDuration", projectDuration);
    console.log("selectedTrackDuration", selectedTrackDuration);
    console.log(
      "projectDuration >= selectedTrackDuration",
      projectDuration >= selectedTrackDuration
    );
    if (regenerateLengthAPICallCount >= MAX_REGEN_CUE_API_CALL_COUNT) {
      showNotification(
        "ERROR",
        "Too many requests. Please wait a few minutes and try again.",
        5000
      );
      dispatch(
        SET_AI_MUSIC_META({
          regenerateLengthAPICallCount: 0,
        })
      );
      setProcessStatus(false);
      setloading(false);
      navigate(NavStrings.PROJECTS);
      return;
    }

    if (!!sonicLogoId && projectDuration >= selectedTrackDuration) {
      setProcessStatus(false);
      setloading(false);
      return;
    }
    console.log("avoidLengthRegeneration", avoidLengthRegeneration);
    console.log("uploadedVideoURL", uploadedVideoURL);
    if (avoidLengthRegeneration && !uploadedVideoURL) {
      let projectMeta = {
        duration: +trackDuration,
      };
      updateProjectMeta({
        projectID,
        projectMeta,
        onSuccess: () => {
          dispatch(SET_AI_MUSIC_META({ avoidLengthRegeneration: false }));
          dispatch(
            SET_PROJECT_META({
              projectDurationInsec: trackDuration,
            })
          );
          setloading(false);
        },
        onError: () => setloading(false),
      });
      return;
    }
    if (projectDuration === selectedTrackDuration) {
      setloading(false);
      return;
    }
    setProcessStatus(true);
    setloading(false);
    let loadingMsg;
    if (uploadedVideoURL) {
      loadingMsg =
        "The length of the track is adjusted to match the length of the video";
    } else {
      loadingMsg =
        "The length of the track is adjusted to match the length of the project";
    }
    setTimeout(() => {
      showNotification("WARNING", loadingMsg, 6000);
    }, 3000);
    // let projectObj = {
    //   mods: [{ section: "all", type: "length", value: projectDuration + "" }],
    // };
    let newModArr = divideDurationBySections(
      selectedAIMusicDetails?.sections?.length,
      projectDuration,
      selectedAIMusicDetails?.cue_parameters?.transition?.time
    )?.map((sectionLength, index) => ({
      section: index + "",
      type: "length",
      value: sectionLength + "",
    }));

    let projectObj = {
      mods: newModArr,
    };
    setProcessPercent(0);
    dispatch(
      SET_AI_MUSIC_META({
        regenerateLengthAPICallCount: regenerateLengthAPICallCount + 1,
      })
    );
    regenerateTrack({
      cueID,
      config: projectObj,
      onSuccess: (response) =>
        generateCueID(response.data.task_id, "LENGTH_CHANGE"),
      onError: () => setloading(false),
    });
  };

  const generateCueID = (taskID, action) => {
    generateCue({
      taskID,
      onProgress: (response) => setProcessPercent(response.data.progress * 100),
      onSuccess: (response) => {
        onGenerateCueSuccess(response, action);
      },
      onError: () => setProcessStatus(false),
    });
  };

  const onGenerateCueSuccess = async (response, action) => {
    let trackTitle =
      selectedAIMusicDetails?.label?.split("##")?.[0] || response?.data?.name;
    let trackDescription = selectedAIMusicDetails.desc || "-";
    let flaxId =
      (response?.data?.sections?.[0]?.flax_tracks?.[0] === "None"
        ? ""
        : response?.data?.sections?.[0]?.flax_tracks?.[0] || "") ||
      SSflaxTrackID;
    let AIMusicTrackDetails = [
      {
        mood: response?.data?.settings?.mood,
        genre: response?.data?.settings?.genre,
        tempo: response?.data?.settings?.tempo,
        length: response?.data?.settings?.length,
        name: trackTitle,
        description: trackDescription,
        cue_id: response?.data?.cue_id,
        parent_cue_id: response?.data?.parent_cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        action,
        project_id: projectID,
      },
    ];
    addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: response?.data?.cue_id,
        sonic_logo_id:
          response?.data?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id: flaxId,
        variantCueIds: JSON.stringify([
          {
            label: `${trackTitle}##${getAIMusicActionPerformed(
              action,
              response?.data
            )}`,
            value: response?.data?.cue_id,
            desc: trackDescription,
            parentCueId: response?.data?.parent_cue_id,
            action,
          },
        ]),
      },
      recentAIGeneratedData,
      onSuccess: () => {
        if (
          [
            AIMusicActions.ADD_DROP_AND_INSTRUMENT_UPDATE,
            AIMusicActions.ADD_DROP,
            AIMusicActions.INSTRUMENT_UPDATE,
          ].includes(action)
        ) {
          showNotification("SUCCESS", getSuccessMessage(action));
          dispatch(
            SET_AI_MUSIC_META({
              previousCueID: selectedAIMusicDetails?.cue_id,
              redoCueID: null,
            })
          );
        } else {
          dispatch(
            SET_AI_MUSIC_META({
              previousCueID: null,
              redoCueID: null,
            })
          );
        }
        setProcessStatus(false);
        setProcessPercent(0);
        if (
          [
            AIMusicActions.ADD_DROP_AND_INSTRUMENT_UPDATE,
            AIMusicActions.INSTRUMENT_UPDATE,
          ].includes(action)
        ) {
          onEditInstrumentsClick();
        }
        navigate(getWorkSpacePath(projectID, response?.data?.cue_id));
      },
      onError: () => {
        setProcessStatus(false);
        setProcessPercent(0);
      },
    });
  };

  const onApplyChangesClick = () => {
    console.log("stemVolume", stemVolume);
    console.log("volumes", selectedAIMusicDetails?.volumes?.[0]);
    console.log("selectedAIMusicDetails", selectedAIMusicDetails);

    dispatch(
      SET_AI_MUSIC_META({
        playedCueID: null,
        playedInstrument: null,
        playedSonicLogo: null,
      })
    );
    dispatch(SET_PROJECT_META({ isTimelinePlaying: false }));
    setProcessStatus(true);
    setProcessPercent(0);

    // let newEnding = endingOption;
    // let currentEnding = getAIMusicEndingOption(
    //   last(selectedAIMusicDetails?.sections)?.ending
    // )?.value;

    // const isEndingSelectedAndUpdated =
    //   !!endingOption &&
    //   endingOption !== "add_sonic_logo" &&
    //   !sonicLogoId &&
    //   newEnding !== currentEnding;

    // let dropSectionIndex = selectedAIMusicDetails?.sections?.findIndex(
    //   (section) => section?.ending === "transition"
    // );

    let hasDropOnCurrentAITrack = Boolean(
      selectedAIMusicDetails?.cue_parameters?.transition?.time
    );

    // console.log("dropSectionIndex", dropSectionIndex);

    let modArray = [];

    // if (isEndingSelectedAndUpdated) {
    //   modArray?.push({
    //     section: "all",
    //     type: "ending",
    //     value: "logo",
    //     param1: endingOption,
    //   });
    // }
    if (isDropSliderVisible) {
      if (hasDropOnCurrentAITrack) {
        modArray?.push(
          {
            section: "0",
            type: "length",
            value: dropPosition + "",
          },
          {
            section: "1",
            type: "length",
            value:
              (!!sonicLogoId
                ? selectedAIMusicDetails?.settings?.length
                : projectDurationInsec) -
              dropPosition +
              "",
          }
        );
      } else {
        modArray?.push({
          section: "0",
          type: "split",
          value: dropPosition + "",
        });
      }
    }
    const isInstrumentUpdated = !isEqual(
      stemVolume,
      selectedAIMusicDetails?.volumes?.[0]
    );
    if (isInstrumentUpdated) {
      let updatedInstruments = reduce(
        stemVolume,
        (result, value, key) => {
          if (!isEqual(selectedAIMusicDetails?.volumes?.[0][key], value)) {
            result[key] = value;
          }
          return result;
        },
        {}
      );
      console.log("updatedInstruments", updatedInstruments);
      for (const key in updatedInstruments) {
        if (Object.prototype.hasOwnProperty.call(updatedInstruments, key)) {
          const volume = updatedInstruments[key];
          modArray?.push({
            section: "all",
            type: "volume",
            value: volume + "",
            param1: key,
          });
        }
      }
    }

    let regenObj = {
      mods: modArray,
    };

    let action;
    if (isDropSliderVisible && isInstrumentUpdated) {
      action = AIMusicActions.ADD_DROP_AND_INSTRUMENT_UPDATE;
    } else if (isDropSliderVisible && !isInstrumentUpdated) {
      action = AIMusicActions.ADD_DROP;
    } else if (!isDropSliderVisible && isInstrumentUpdated) {
      action = AIMusicActions.INSTRUMENT_UPDATE;
    }
    console.log("regenObj", regenObj);
    regenerateTrack({
      cueID: selectedAIMusicDetails?.cue_id,
      config: regenObj,
      onSuccess: (response) => generateCueID(response.data.task_id, action),
      onError: () => setProcessStatus(false),
    });
  };

  const onEditInstrumentsClick = () => {
    var content = document.getElementById("instrument-panel");
    if (content.style.maxHeight) {
      setTrackedit(false);
      content.style.maxHeight = null;
      dispatch(
        SET_AI_MUSIC_META({
          playedInstrument: null,
        })
      );
    } else {
      setTrackedit(true);
      content.style.maxHeight = content.scrollHeight + "px";
    }
  };

  const onUndoClicked = () => {
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: previousCueID,
        sonic_logo_id: sonicLogoId,
        flax_id: SSflaxTrackID,
      },
      recentAIGeneratedData,
      onSuccess: () => {
        navigate(getWorkSpacePath(projectID, previousCueID));
        dispatch(
          SET_AI_MUSIC_META({
            avoidLengthRegeneration: true,
            redoCueID: selectedAIMusicDetails?.cue_id,
            previousCueID: null,
          })
        );
      },
    });
  };

  const onRemoveLogoClicked = () => {
    const removedSonicLogoId =
      recentAIGeneratedData.find((item) => item.action === "SONIC_LOGO_APPEND")
        ?.parentCueId || "";
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: removedSonicLogoId,
        sonic_logo_id: null,
        flax_id: SSflaxTrackID,
      },
      recentAIGeneratedData,
      onSuccess: () => {
        navigate(getWorkSpacePath(projectID, removedSonicLogoId));
        dispatch(
          SET_AI_MUSIC_META({
            avoidLengthRegeneration: true,
            redoCueID: selectedAIMusicDetails?.cue_id,
            previousCueID: null,
          })
        );
      },
    });
  };

  const onRedoClicked = () => {
    updateAIMusicMeta({
      projectID,
      AIMusicMeta: {
        cueId: redoCueID,
        sonic_logo_id: sonicLogoId,
        flax_id: SSflaxTrackID,
      },
      recentAIGeneratedData,
      onSuccess: () => {
        navigate(getWorkSpacePath(projectID, redoCueID));
        dispatch(
          SET_AI_MUSIC_META({
            avoidLengthRegeneration: true,
            redoCueID: null,
            previousCueID: selectedAIMusicDetails?.cue_id,
          })
        );
      },
    });
  };

  return (
    <>
      {loading && <CustomLoader />}
      {processStatus && <CustomLoader processPercent={processPercent} />}
      <div
        className="dashboard_layout_container"
        style={{
          display: uploadedVideoURL ? "flex" : "block",
        }}
      >
        <div className="left_dashboard_layout_container">
          <AITrackCard type="DASHBOARD_BLOCK" data={selectedAIMusicDetails} />
          {checkAIMusicEditAccess() && (
            <>
              <DropBlock onRemoveLogoClicked={onRemoveLogoClicked} />
              <SonicLogoPanel />
              <InstrumentsPanel
                key={`instrumentsPanel_${selectedAIMusicDetails?.cue_id}`}
                isOpen={trackedit}
              />
            </>
          )}
          <div
            className="dashboard-panel-btn-container"
            style={{
              marginTop: trackedit ? "15px" : "0px",
            }}
          >
            {checkAIMusicEditAccess() && (
              <>
                <div className="btn-left">
                  <ButtonWrapper
                    variant="filled"
                    className="edit_instruments_btn"
                    onClick={onEditInstrumentsClick}
                  >
                    <div className="edit_instruments_btn_content">
                      <span className="boldFamily">Edit Instruments</span>
                      <Arrow
                        style={{
                          rotate: trackedit ? "180deg" : "0deg",
                        }}
                        alt="^"
                      />
                    </div>
                  </ButtonWrapper>
                  <ButtonWrapper
                    variant="filled"
                    disabled={
                      !isDropSliderVisible &&
                      isEqual(stemVolume, selectedAIMusicDetails?.volumes?.[0])
                      // &&
                      // !(
                      //   !!endingOption &&
                      //   ![
                      //     "add_sonic_logo",
                      //     getAIMusicEndingOption(
                      //       last(selectedAIMusicDetails?.sections)?.ending
                      //     )?.value,
                      //   ].includes(endingOption)
                      // )
                    }
                    onClick={onApplyChangesClick}
                  >
                    Apply Changes
                  </ButtonWrapper>
                  {previousCueID && (
                    <ButtonWrapper
                      variant="filled"
                      className="undo_redo_btn"
                      onClick={onUndoClicked}
                    >
                      <div className="undo_redo_btn_content">
                        <IconWrapper icon="Undo" />
                        <span className="boldFamily">Undo</span>
                      </div>
                    </ButtonWrapper>
                  )}
                  {redoCueID && (
                    <ButtonWrapper
                      variant="filled"
                      className="undo_redo_btn"
                      onClick={onRedoClicked}
                    >
                      <div className="undo_redo_btn_content">
                        <IconWrapper icon="Redo" />
                        <span className="boldFamily">Redo</span>
                      </div>
                    </ButtonWrapper>
                  )}
                </div>
              </>
            )}
            {checkAIMusicVariantAccess() && (
              <>
                <div className="btn-right">
                  {/* <ButtonWrapper
                    onClick={() => {
                      setIsVariantModalOpen(true);
                    }}
                  >
                    + Get Variants
                  </ButtonWrapper> */}
                </div>
                <ModalWrapper
                  isOpen={isVariantModalOpen}
                  onClose={() => setIsVariantModalOpen(false)}
                >
                  <BrandTagsModal
                    type="LOAD_MORE"
                    closeModal={setIsVariantModalOpen}
                    setVariantsDetails={setVariantsDetails}
                    tagsToShow={flaxTrackID ? "FLAX_TRACK_TAGS" : "BRAND_TAGS"}
                    setLoading={setloading}
                  />
                </ModalWrapper>
              </>
            )}
          </div>
        </div>
      </div>
      <DashboardTrackVariantList
        variantsDetails={variantsDetails}
        setVariantsDetails={setVariantsDetails}
        variantLoading={variantLoading}
      />
    </>
  );
}
