import "./FileUploadField.css";
import { useField, useFormikContext } from "formik";
import { ReactComponent as AddIcon } from "../../../../../static/common/add_thin.svg";
import { ReactComponent as CloseIcon } from "../../../../../static/common/close_thin.svg";
import NavStrings from "../../../../../routes/constants/NavStrings";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import ModalWrapper from "../../../../../branding/componentWrapper/ModalWrapper";
import ButtonWrapper from "../../../../../branding/componentWrapper/ButtonWrapper";
import removeProjectVideo from "../../../services/videoDB/removeProjectVideo";
import { useDispatch, useSelector } from "react-redux";
import axiosCSPrivateInstance from "../../../../../axios/axiosCSPrivateInstance";
import { SET_VIDEO_META } from "../../../redux/videoSlice";
import { SET_AI_MUSIC_Stability_META } from "../../../redux/AIMusicStabilitySlice";
import { SET_AI_Track_Stability_META } from "../../../redux/AITrackStabilitySlice";

function DeleteModal({ open, close, details }) {
    // console.log('details', details)
    let dispatch = useDispatch()
    const { stabilitymp3Url, latestFiledataStability } = useSelector((state) => state.AIMusicStability);
    const { stabilityArr } = useSelector((state) => state.AITrackStability);


    const removeVideo = (projectID, id) => {
        removeProjectVideo({ projectID });
        dispatch(SET_VIDEO_META({ uploadedVideoFile: null }));
        close()
    }

    const removeAIAnalysisData = (analysisId) => {
        if (!analysisId) return console.log("analysisId not found : ", analysisId);
        // call api to remove analysis by analysisId and add this in on success
        axiosCSPrivateInstance
            ?.delete(`stability/deleteByProjectId/${details?.type}/${analysisId}`)
            .then(() => {

                const removedStability = stabilityArr?.filter(
                    (item) => item.type !== details?.type && !!item?.sentFileName)

                dispatch(
                    SET_AI_Track_Stability_META({ stabilityArr: stabilityArr })
                );
                dispatch(
                    SET_AI_MUSIC_Stability_META({ stabilityLoading: false, mp3Urls: stabilitymp3Url, latestFiledataStability: removedStability })
                );
                // const AIMusic
                close()
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <ModalWrapper
            isOpen={open}
            onClose={close}
            className="ai_Music_genrator_3_dialog"
        >
            <div>
                {
                    details?.deleteKey == "brief" ? (
                        <span>
                            You are about to remove your brief, are you sure you want to proceed?
                        </span>
                    ) : (
                        <>
                            <h2>Are you sure you want to delete this video?</h2>
                            <span>Deleting the video won’t affect your project’s current length. To adjust the project duration, click<br /> the Edit icon at the top right. The track will automatically adapt to the new length.</span>
                        </>
                    )
                }
                <div className="action_btn">
                    <ButtonWrapper
                        // style={{ width: "250px" }}
                        onClick={() => close()}
                    >
                        Cancel
                    </ButtonWrapper>
                    <ButtonWrapper
                        variant="filled"
                        // style={{ width: "250px" }}
                        onClick={() => {
                            if (details?.deleteKey === "brief") {
                                removeAIAnalysisData(details?.analaysisID);
                            } else {
                                removeVideo(details?.projectID);
                                if (details?.projectID) {
                                    removeAIAnalysisData(details?.projectID);
                                }
                            }
                        }}
                    >
                        Delete
                    </ButtonWrapper>
                </div>
            </div>
        </ModalWrapper >
    )
}

export default function FileUploadFieldStability({ name, label, accept, called, prevStability }) {
    const [field, meta] = useField(name);
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const fileInputRef = useRef(null);
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [shareData, setShareData] = useState({})
    const [open, setOpen] = useState(false)
    const { projectID } = useSelector((state) => state.projectMeta);
    const { uploadedVideoURL, uploadedVideoBlobURL } = useSelector((state) => state.video);
    const filterForVideo = prevStability?.filter(item => item.type === 1 && !!item?.sentFileName) || null
    const filterForBrief = prevStability?.filter(item => item.type === 3 && !!item?.sentFileName) || null
    const disabledIfSomethingUploaded = prevStability?.find(item => item?.status === "in_progress");

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setFieldValue(name, file);
        setFieldTouched(name, true); // ✅ manually mark as touched
    };

    const handleRemoveFile = (e, name, type, id = projectID) => {
        if (uploadedVideoBlobURL || uploadedVideoURL || !!type) {
            setOpen(true)
            e.preventDefault(); // prevent button from submitting form
            setFieldValue(name, null);
            setFieldTouched(name, true);
        } else {
            e.preventDefault(); // prevent button from submitting form
            setFieldValue(name, null);
            setFieldTouched(name, true);
        }

        if (name === "videoFile" && type === 1) {
            setShareData({ projectID: projectID, analaysisID: id, deleteKey: "video", type: type });
        } else if (name === "briefFile" && type === 3) {
            setShareData({ projectID: projectID, analaysisID: projectID, deleteKey: "brief", type: type });
        }

        // If removing videoFile or briefFile, clear analyzeOptions
        if (name === "videoFile" || name === "briefFile" || name === "yourPrompt") {
            setFieldValue("analyzeOptions", []);
        }
    };

    const handleRedirect = () => {
        navigate(NavStrings.UPLOAD_VIDEO, { state: { videoUpload: "video" } })
    }

    const handleRemoveFileFromProject = (ID) => {
        setFieldValue(name, null);
        setFieldTouched(name, true);
        removeProjectVideo({ projectID });
        dispatch(SET_VIDEO_META({ uploadedVideoFile: null }));
    }
    const isDisabled = filterForBrief && filterForBrief.length > 0;
    // console.log('isDisabled', isDisabled)
    return (
        <div className="file-field-container">
            <label htmlFor={name} className="file-upload-button">
                {
                    filterForVideo?.length > 0 || filterForBrief?.length > 0 ? (
                        <span className="file-label">
                            {filterForVideo?.[0]?.sentFileName || filterForBrief?.[0]?.sentFileName || label}
                        </span>
                    ) : (uploadedVideoBlobURL || uploadedVideoURL) && called === 1 ? (
                        <span className="file-label" >
                            {uploadedVideoURL || label}
                        </span>
                    ) : (
                        <span className="file-label" onClick={called === 1 ? handleRedirect : null}>
                            {field.value ? field.value.name : label}
                        </span>
                    )
                }
                <button
                    type="button"
                    className="file-upload-button-icon"
                    disabled={disabledIfSomethingUploaded}
                    onClick={(e) => {
                        e?.stopPropagation();
                        if (filterForVideo?.length > 0 || filterForBrief?.length > 0) {
                            handleRemoveFile(
                                e,
                                name,
                                filterForVideo?.[0]?.type || filterForBrief?.[0]?.type,
                                projectID
                            );
                            console.log('Added file2')
                        } else if ((uploadedVideoBlobURL || uploadedVideoURL) && called === 1) {
                            handleRemoveFileFromProject(projectID);
                            console.log('Added file1')
                        } else {
                            console.log('Added file')
                            if (called === 1) {
                                handleRedirect()
                            } else {
                                fileInputRef.current?.click();
                            }
                        }
                    }}
                >
                    {filterForBrief?.length > 0 || filterForVideo?.length > 0 || field.value || ((uploadedVideoBlobURL || uploadedVideoURL) && called === 1) ? <CloseIcon /> : <AddIcon />}
                </button>
                {
                    called == 1 ? null :
                        <input
                            id={name}
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={isDisabled || disabledIfSomethingUploaded}
                            className="hidden-file-input"
                        />
                }
            </label>
            {
                meta.touched && meta.error && (
                    <div className="field-error">{meta.error}</div>
                )
            }
            <DeleteModal open={open} close={() => setOpen(false)} details={shareData} />
        </div >
    );
}

