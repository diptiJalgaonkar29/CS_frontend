import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import "./VideoLayoutForShell.css";
import { useConfig } from "../../../customHooks/useConfig";
import { SET_VIDEO_META } from "../../../modules/workSpace/redux/videoSlice";
import { SET_PROJECT_META } from "../../../modules/workSpace/redux/projectMetaSlice";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import Timeline from "../../../modules/workSpace/components/Timeline/Timeline";
import WSHeaderActionBtns from "../../../modules/workSpace/components/WSHeaderActionBtns/WSHeaderActionBtns";
import b64toBlob from "../../../utils/b64toBlob";
import removeProjectVideo from "../../../modules/workSpace/services/videoDB/removeProjectVideo";
import saveCoverImage from "../../../modules/workSpace/services/videoDB/saveCoverImage";
import getVideoProcessStatus from "../../../modules/workSpace/services/videoDB/getVideoProcessStatus";
import showNotification from "../../helperFunctions/showNotification";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import axiosCSPrivateInstance from "../../../axios/axiosCSPrivateInstance";
import UpdateProjectLengthSameAsTTSVoicesModal from "../../../modules/projects/components/UpdateProjectLengthSameAsTTSVoicesModal/UpdateProjectLengthSameAsTTSVoicesModal";

const VideoLayoutForShell = ({ children }) => {
    const { uploadedVideoURL, uploadedVideoBlobURL, coverImage } = useSelector(
        (state) => state.video
    );
    const {
        projectID,
        isVideoPlaying,
        timelineSeekTime,
        isVideoLoading,
        isVideoProcessing,
    } = useSelector((state) => state.projectMeta);
    let { config, jsonConfig } = useConfig();
    const dispatch = useDispatch();
    const [processPercent, setProcessPercent] = useState(0);
    const [isErroredVideo, setisErroredVideo] = useState(false);
    const videoRef = useRef();
    const { TTSTimelineVoicesMP3 } = useSelector((state) => state.voices);
    const { selectedAIMusicDetails } = useSelector((state) => state.AIMusic);

    const fetchVideoFromServer = (controller) => {
        dispatch(
            SET_PROJECT_META({
                isVideoLoading: true,
            })
        );

        axiosCSPrivateInstance(`/video/${uploadedVideoURL}`, {
            responseType: "blob",
            signal: controller.signal,
            onDownloadProgress: (progressEvent) => {
                const percentage = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                setProcessPercent(percentage);
            },
        })
            .then((response) => {
                if (
                    !response?.data?.type?.includes("video/") ||
                    response?.data?.size === 0
                )
                    return;
                const url = window.URL.createObjectURL(new Blob([response.data]));
                setisErroredVideo(false);
                dispatch(SET_VIDEO_META({ uploadedVideoBlobURL: url }));
                let thumbnailsArr = [];
                generateVideoThumbnails(response.data, 20)
                    .then((thumbnails) => {
                        if (!coverImage && thumbnails?.length > 0) {
                            let thumbnailToSave = thumbnails?.[Math.round(20 / 2)];
                            saveCoverImage({
                                projectID,
                                base64ImageUrl: thumbnailToSave,
                            });
                        }
                        thumbnails.forEach((thumbnail) => {
                            const parts = thumbnail.split(";base64,");
                            // Hold the content type
                            const contentType = parts[0].split(":")[1];
                            // Decode Base64 string
                            const b64Data = parts[1];
                            var blob = b64toBlob(b64Data, contentType);
                            var blobUrl = URL.createObjectURL(blob);
                            thumbnailsArr.push(blobUrl);
                        });
                        dispatch(
                            SET_VIDEO_META({
                                thumbnails: thumbnailsArr.slice(0, 20),
                            })
                        );
                    })
                    .catch((err) => {
                        console.log("Error :", err);
                        dispatch(
                            SET_PROJECT_META({
                                isVideoLoading: false,
                            })
                        );
                    });
            })
            .catch((err) => {
                console.log("err", err);
                dispatch(
                    SET_PROJECT_META({
                        isVideoLoading: false,
                    })
                );
            });
    };

    useEffect(() => {
        if (!isVideoProcessing) return;
        let intevalId;
        intevalId = setInterval(() => {
            getVideoProcessStatus({ projectID }).then((res) => {
                if (res?.status === "completed") {
                    dispatch(
                        SET_PROJECT_META({
                            isVideoProcessing: false,
                        })
                    );
                    showNotification("SUCCESS", `Your video has been processed`, 4000);
                    clearInterval(intevalId);
                }
            });
        }, jsonConfig?.FETCH_AUDIO_FROM_VIDEO_INTERVAL || 10000);

        return () => {
            clearInterval(intevalId);
        };
    }, [isVideoProcessing]);

    useEffect(() => {
        if (!uploadedVideoURL || isVideoProcessing) return;
        const controller = new AbortController();
        if (!uploadedVideoBlobURL) {
            fetchVideoFromServer(controller);
        } else {
            setProcessPercent(100);
        }
        return () => controller.abort();
    }, [uploadedVideoURL, isVideoProcessing]);

    useEffect(() => {
        const controller = new AbortController();
        let fetchVideoCount = 0;
        const MAX_FETCH_VIDEO_LIMIT = 3;
        if (!isErroredVideo) return;
        let id = setTimeout(() => {
            if (fetchVideoCount < MAX_FETCH_VIDEO_LIMIT) {
                fetchVideoFromServer(controller);
                fetchVideoCount++;
            } else {
                console.log("MAX_FETCH_VIDEO_LIMIT reached !!!!");
            }
        }, 5000);
        return () => {
            controller.abort();
            clearTimeout(id);
            fetchVideoCount = 0;
        };
    }, [isErroredVideo]);

    const removeVideo = (projectID) => {
        removeProjectVideo({ projectID });
    };

    useEffect(() => {
        if (
            !videoRef.current ||
            [null, undefined].includes(timelineSeekTime) ||
            isNaN(timelineSeekTime)
        )
            return;
        videoRef.current?.seekTo(timelineSeekTime, "seconds");
    }, [timelineSeekTime]);

    const onVideoError = () => {
        console.log("Error while loading video ", uploadedVideoBlobURL);
        dispatch(SET_VIDEO_META({ uploadedVideoBlobURL: "" }));
        setisErroredVideo(true);
    };

    const onVideoReady = (e) => {
        if (e.getSecondsLoaded()) {
            dispatch(
                SET_PROJECT_META({
                    isVideoLoading: false,
                })
            );
        }
    };

    return (
        <>
            <WSHeaderActionBtns />
            <div className="video_layout_containerForShell" id="video_layout_containerForShell">
                <div
                    className="content_container"
                    style={{ width: uploadedVideoURL ? "70%" : "100%" }}
                >
                    {children}
                    <div
                        className="video_layout_containerForShell_filler"
                        id="video_layout_containerForShell_filler"
                    />
                </div>
                {uploadedVideoURL && (
                    <div className={`video_container`}>
                        <button
                            className="delete_icon_btn"
                        // disabled={isVideoLoading || isVideoProcessing}
                        >
                            <IconWrapper
                                icon="Trash"
                                onClick={() => {
                                    removeVideo(projectID);
                                }}
                            />
                        </button>
                        {isVideoLoading && (
                            <div className="video_container_loader">
                                <CustomLoaderSpinner processPercent={processPercent} />
                            </div>
                        )}
                        {isVideoProcessing && (
                            <div className="video_container_processing">
                                <CustomLoaderSpinner />
                                <p>Your video is processing</p>
                            </div>
                        )}
                        <ReactPlayer
                            style={{
                                backgroundColor: "var(--color-secondary)",
                                borderRadius: "10px",
                                overflow: "hidden",
                            }}
                            ref={videoRef}
                            width="100%"
                            height="350px"
                            controls
                            muted={true}
                            url={uploadedVideoBlobURL}
                            playing={isVideoPlaying}
                            onError={onVideoError}
                            onReady={onVideoReady}
                            className="project_video"
                            id="project_video"
                            config={{
                                file: {
                                    attributes: {
                                        controlsList: "nodownload noplaybackrate noremoteplayback",
                                        disablePictureInPicture: true,
                                    },
                                },
                            }}
                        />
                    </div>
                )}
            </div>
            {TTSTimelineVoicesMP3?.length !== 0 ||
                selectedAIMusicDetails?.cue_id ||
                uploadedVideoURL ? (
                <>
                    <UpdateProjectLengthSameAsTTSVoicesModal />
                    <Timeline />
                </>
            ) : null}
        </>
    );
};

export default VideoLayoutForShell;
