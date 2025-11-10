import React, { useState } from "react";
import { ReactComponent as SoundEdit } from "../../../../static/voice/sound_edit.svg";
import { ReactComponent as Left_arrow } from "../../../../static/common/arrow_border.svg";
import { ReactComponent as Add } from "../../../../static/common/add_border.svg";
import { useNavigate } from "react-router-dom";
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

const WSSubHeaderShell = ({ type = "" }) => {
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const { activeWSTab, projectID } = useSelector((state) => state.projectMeta);
    const { recentAIGeneratedData, cueID, isFreshAITracksListPage, flaxTrackID } =
        useSelector((state) => state.AIMusic);
    const [loading, setloading] = useState(false);
    const { tXsplit } = useSelector((state) => state.video);

    let headerData;

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
                    },
                    {
                        Icon: SoundEdit,
                        label: "Edit Pronunciation",
                        onClick: () => {
                            dispatch(SET_VOICE_META({ isDictModalOpen: true }));
                        },
                        enable: true,
                    },
                ]
                : [
                    recentAIGeneratedData?.length > 1 && !isFreshAITracksListPage
                        ? {
                            Icon: Left_arrow,
                            label: "Back to first music selection",
                            onClick: () => {
                                navigate(NavStrings.RECENT_AI_MUSIC);
                            },
                            enable:
                                checkAIMusicVariantAccess() ||
                                checkAIMusicEditAccess() ||
                                checkAIMusicCreateAccess(),
                        }
                        : null,
                    isFreshAITracksListPage
                        ? {
                            Icon: Left_arrow,
                            label: "Change Genre and Mood",
                            onClick: () => {
                                setIsVariantModalOpen(true);
                            },
                            enable: false,
                        }
                        : null,
                ].filter((data) => !!data && data.enable);
    }

    if (headerData.length === 0) return <div className="WS_sub_header_filler" />;
    console.log("first")

    return (
        <>
            {loading && <CustomLoader />}
            {headerData?.length > 0 && (
                <div className="AI_tab_header_menu_container">
                    {headerData?.map(({ Icon, enable, label, onClick }) => (
                        <div
                            key={label}
                            style={{ display: enable ? "flex" : "none" }}
                            className="AI_tab_header_menu_item_container"
                            onClick={onClick}
                        >
                            <Icon className="AI_tab_header_menu_icons" />
                            <p className={`AI_tab_menu_title`}>{label}</p>
                        </div>
                    ))}
                </div>
            )}

            <ModalWrapper
                isOpen={isVariantModalOpen}
                onClose={() => setIsVariantModalOpen(false)}
            >
                {!loading && (
                    <BrandTagsModal
                        type="FRESH_TRACKS"
                        closeModal={setIsVariantModalOpen}
                        tagsToShow={flaxTrackID ? "FLAX_TRACK_TAGS" : "BRAND_TAGS"}
                        setLoading={setloading}
                    />
                )}
            </ModalWrapper>
        </>
    );
};

export default WSSubHeaderShell;