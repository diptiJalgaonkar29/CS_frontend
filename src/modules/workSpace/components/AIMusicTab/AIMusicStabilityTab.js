import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import "./AIMusicTab.css";
import { ReactComponent as Arrow } from "../../../../static/common/downArrow.svg";
import AITrackCard from "../AITrackCard/AITrackCard";
import { useNavigate, useParams } from "react-router-dom";
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
import Timeline from "../Timeline/Timeline";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

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

export default function AIMusicStabilityTab({ cueID }) {
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
    const { currentUseThisTrack } = useSelector((state) => state.AITrackStability);
    const [blobKey, setBlobKey] = useState();
    let { cue_id } = useParams();



    useEffect(() => {
        console.log("currentUseThisTrack", currentUseThisTrack)
        console.log("cue_id", cue_id)
        if (!currentUseThisTrack || !cue_id) return;
        let objectToSendInApi = currentUseThisTrack?.length > 0 ? currentUseThisTrack : cue_id
        
        console.log("objectToSendInApi", objectToSendInApi)
        const generateBlob = async () => {
            try {
                const { data } = await axiosCSPrivateInstance.get(
                    `stability/getByUserData/${objectToSendInApi}`
                );
                console.log("data____", data)
                const fileName = data.fileName;
                console.log("fileName", fileName);

                const res = await axiosCSPrivateInstance.get(
                    `/stability/GetMediaFile/${projectID}/${fileName}`,
                    { responseType: "blob" }
                );

                const objectURL = URL.createObjectURL(res.data);
                console.log("Fetched Stability MP3 file:", objectURL);

                setBlobKey(objectURL);
            } catch (err) {
                console.error("Failed to generate blob URL:", err);
            }
        };

        generateBlob();
    }, [currentUseThisTrack, cue_id]);

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
                    <AITrackCard type="DASHBOARD_BLOCK" stabilityArr={[blobKey]} />
                </div>
            </div>
        </>
    );
}
