import React, { useEffect, useState } from "react";
import "./WSHeaderActionBtns.css";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { SET_PROJECT_META } from "../../redux/projectMetaSlice";
import getProjectAssetsType from "../../../../utils/getProjectAssetsType";
import WSSubHeader from "../WSSubHeader/WSSubHeader";
import updateProjectMeta from "../../services/projectDB/updateProjectMeta";
import SonicButton from "../../../../branding/sonicspace/components/Button/SonicButton";
import _ from "lodash";
import {
  checkAIMusicAccess,
  checkAIMusicCreateAccess,
  checkAIMusicEditAccess,
  checkAIVoiceAccess,
} from "../../../../utils/checkAppAccess";
import EditProjectLengthModal from "../EditProjectLengthModal/EditProjectLengthModal";

export default function WSHeaderActionBtns() {
  const { cue_id } = useParams();
  const dispatch = useDispatch();
  const { activeWSTab, projectID, assetsType } = useSelector(
    (state) => state.projectMeta
  );
  const { uploadedVideoURL, tXStatus, tXsplit, tXfilePath, tXId } = useSelector(
    (state) => state.video
  );
  const {
    selectedAIMusicDetails,
    SSflaxTrackID,
    flaxTrackID,
    aiMusicGeneratorProgress,
    aiMusicGeneratorTrackDetails,
  } = useSelector((state) => state.AIMusic);
  const { appAccess } = useSelector((state) => state.auth);
  const { TTSTimelineVoicesMP3 } = useSelector((state) => state.voices);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { freshAITracksVariantsList } = useSelector((state) => state.AIMusic);
  const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);

  const getActiveWSTab = (appAccess, condition) => {
    if (appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
      return condition ? "Voice" : "AI Music";
    } else if (!appAccess?.AI_MUSIC && appAccess?.AI_VOICE) {
      return "Voice";
    } else if (appAccess?.AI_MUSIC && !appAccess?.AI_VOICE) {
      return "AI Music";
    } else {
      return "Voice";
    }
  };

  useEffect(() => {
    console.log("params:", {
      freshAITracksVariantsListCount: freshAITracksVariantsList?.length,
      aiMusicGeneratorProgressId: aiMusicGeneratorProgress?.id,
      aiMusicGeneratorTrackDetailsCount: aiMusicGeneratorTrackDetails?.length,
      cue_id,
      uploadedVideoURL,
      tXsplit,
    });
    console.log(
      "freshAITracksVariantsList?.length > 0",
      freshAITracksVariantsList?.length > 0
    );
    console.log("aiMusicGeneratorProgress?.id", aiMusicGeneratorProgress?.id);
    console.log(
      "aiMusicGeneratorTrackDetails?.length > 0",
      aiMusicGeneratorTrackDetails?.length > 0
    );
    console.log(
      "!!uploadedVideoURL && !!tXsplit",
      !!uploadedVideoURL && !!tXsplit
    );
    console.log(
      'getActiveWSTab(appAccess, tXsplit === "1")',
      getActiveWSTab(appAccess, tXsplit === "1")
    );
    console.log(
      "getActiveWSTab(appAccess, !cue_id)",
      getActiveWSTab(appAccess, !cue_id)
    );
    dispatch(
      SET_PROJECT_META({
        activeWSTab:
          freshAITracksVariantsList?.length > 0 ||
            aiMusicGeneratorProgress?.id ||
            aiMusicGeneratorTrackDetails?.length > 0 ||
            !!cue_id
            ? "AI Music"
            : !!uploadedVideoURL && !!tXsplit
              ? getActiveWSTab(appAccess, Number(tXsplit) === 1)
              : activeWSTab || "AI Music",
      })
    );
  }, [
    freshAITracksVariantsList?.length,
    aiMusicGeneratorProgress?.id,
    aiMusicGeneratorTrackDetails?.length,
    cue_id,
    uploadedVideoURL,
    tXsplit,
  ]);

  useEffect(() => {
    const updateAssetType = setTimeout(() => {
      let assets = getProjectAssetsType();
      console.log("assets", assets);
      console.log("assetsType", assetsType);
      if (assets == assetsType) return;
      let projectMeta = {
        assets: assets,
      };
      updateProjectMeta({
        projectID,
        projectMeta,
        onSuccess: (res) =>
          dispatch(
            SET_PROJECT_META({
              assetsType: assets,
            })
          ),
      });
    }, 3000);

    return () => clearTimeout(updateAssetType);
  }, [
    uploadedVideoURL,
    TTSTimelineVoicesMP3?.length,
    selectedAIMusicDetails?.cue_id,
    currentUseThisTrack,
    assetsType,
  ]);

  return (
    <>
      <div className="WS_header_action_btns_container">
        <div className="nav-btn-left">
          {Boolean(checkAIMusicAccess()) &&
            Boolean(
              checkAIMusicCreateAccess() || SSflaxTrackID || flaxTrackID
            ) && (
              <SonicButton
                onClick={() => {
                  dispatch(SET_PROJECT_META({ activeWSTab: "AI Music" }));
                }}
                disabled={!!tXStatus && Number(tXsplit) === 1}
                className={`tab_btns ${activeWSTab === "AI Music" ? "activeWSBtn" : "inactiveWSBtn"
                  }`}
              >
                AI Music
              </SonicButton>
            )}
          {checkAIVoiceAccess() && (
            <SonicButton
              onClick={() => {
                dispatch(SET_PROJECT_META({ activeWSTab: "Voice" }));
              }}
              disabled={!!tXStatus && tXsplit === "0"}
              className={`boldFamily tab_btns ${
                activeWSTab === "Voice" ? "activeWSBtn" : "inactiveWSBtn"
              }`}
            >
              Voices
            </SonicButton>
          )}
        </div>
        <div className="nav-btn-right">
          {/* {!uploadedVideoURL && (
            <>
              {(checkAIMusicEditAccess() ||
                (checkAIVoiceAccess() && !checkAIMusicAccess())) && (
                  <EditProjectLengthModal
                    isOpen={isProjectModalOpen}
                    onClose={() => setIsProjectModalOpen(false)}
                    onOpen={() => setIsProjectModalOpen(true)}
                  />
                )}
            </>
          )} */}
          <EditProjectLengthModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onOpen={() => setIsProjectModalOpen(true)}
          />
        </div>
      </div>
      <WSSubHeader />
    </>
  );
}
