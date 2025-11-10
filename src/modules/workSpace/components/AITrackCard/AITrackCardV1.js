import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./AITrackCard.css";
import { useConfig } from "../../../../customHooks/useConfig";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";
import getWorkSpacePath from "../../../../utils/getWorkSpacePath";
import isDevServer from "../../../../utils/isDevServer";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import NavStrings from "../../../../routes/constants/NavStrings";
import WaveSurfer from "wavesurfer.js";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import formatTime from "../../../../utils/formatTime";

const AITrackCardV1 = ({
    data,
    type,
    hideTrackTags = false,
    index = 0,
    onTrackSelect,
    showSelectedHighlighted = false,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const music = useRef(null);
    let { theme } = useConfig();
    // let isCSTrack = data?.csToSsStatus;
    let isCSTrack = data?.cs_to_ss_status;
    const [curtime, setcurtime] = useState("00:00");
    const [duration, setduration] = useState("00:00");
    const {
        selectedAIMusicDetails,
        playedSSTrack
    } = useSelector((state) => state.AIMusic);
    const { projectID, projectDurationInsec } = useSelector(
        (state) => state.projectMeta
    );
    const [isTrackLoading, setIsTrackLoading] = useState(true);
    const [loadingPercent, setLoadingPercent] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [waveform, setWaveform] = useState(null);
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [progress, setProgress] = useState(0);
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);


    // const fetchFiles = async () => {
    //     let fileUrl = isDevServer ? "MB_AudioMASTER_ComeAlive_0dBfs.mp3" : data?.preview_track_url;
    //     // Show loading immediately
    //     setIsTrackLoading(true);
    //     setLoadingPercent(0); // Optional: reset loading percent

    //     try {
    //         const options = { responseType: "blob" };
    //         const [waveformResponse, audioResponse] = await Promise.all([
    //             axiosSSPrivateInstance.get(`/files/waveforms/${fileUrl}.png`, options),
    //             axiosSSPrivateInstance.get(`/files/mp3s/${fileUrl}`, options),
    //         ]);

    //         setWaveform(URL.createObjectURL(waveformResponse.data));
    //         setAudioPlayer(URL.createObjectURL(audioResponse.data));
    //         initWaveform(URL.createObjectURL(audioResponse.data)); // ✅ Loads waveform but doesn't auto-play

    //     } catch (error) {
    //         console.error("Error fetching files:", error);
    //     }
    // };

    const [cachedFiles, setCachedFiles] = useState({});
    const lastInitializedFileRef = useRef(null);

    // 🔁 Fetch and Init only if not done before
    const fetchFiles = async () => {
        const fileUrl = isDevServer
            ? "MB_AudioMASTER_ComeAlive_0dBfs.mp3"
            : data?.preview_track_url;



        // ✅ Skip if already initialized and same file
        if (fileUrl === lastInitializedFileRef.current && cachedFiles[fileUrl]) {
            console.log("Waveform already initialized for:", fileUrl);
            setWaveform(cachedFiles[fileUrl].waveformURL);
            setAudioPlayer(cachedFiles[fileUrl].audioURL);
            return;
        }

        setIsTrackLoading(true);
        setLoadingPercent(0);

        try {
            const options = { responseType: "blob" };
            const [waveformResponse, audioResponse] = await Promise.all([
                axiosSSPrivateInstance.get(`/files/waveforms/${fileUrl}.png`, options),
                axiosSSPrivateInstance.get(`/files/mp3s/${fileUrl}`, options),
            ]);

            const waveformURL = URL.createObjectURL(waveformResponse.data);
            const audioURL = URL.createObjectURL(audioResponse.data);

            // Cache the loaded blob URLs
            setCachedFiles(prev => ({
                ...prev,
                [fileUrl]: {
                    waveformURL,
                    audioURL,
                },
            }));

            setWaveform(waveformURL);
            setAudioPlayer(audioURL);

            // ✅ Only initialize waveform if not done already
            if (fileUrl !== lastInitializedFileRef.current) {
                initWaveform(audioURL);
                lastInitializedFileRef.current = fileUrl;
            }

        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };


    const initWaveform = useCallback((audioUrl) => {
        if (!waveformRef.current) return;

        // Destroy previous instance if exists
        if (wavesurfer.current) {
            wavesurfer.current.destroy();
        }

        // Initialize new WaveSurfer instance
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: `${theme?.["--color-wave-bg"]}`,
            progressColor: `${theme?.["--color-wave-progress"]}`,
            barWidth: 2,
            responsive: true,
            height: 60,
            width: "100%",
            barWidth: 1,
            barRadius: 1,
            hideScrollbar: true,
            barGap: 5,
            barMinHeight: 2,
            cursorWidth: 1
        });

        // Load the audio file
        wavesurfer.current.load(audioUrl);

        // Events
        wavesurfer.current.on("ready", () => {
            setduration(formatTime(wavesurfer.current?.getDuration()));
            setIsTrackLoading(false); // Hide loader
        });

        wavesurfer.current.on("loading", (percent) => {
            setLoadingPercent(percent);
            setIsTrackLoading(true); // Keep loader visible while loading
        });

        wavesurfer.current.on("audioprocess", () => {
            const currentTime = wavesurfer.current?.getCurrentTime();
            const duration = wavesurfer.current?.getDuration();

            if (currentTime !== undefined && duration) {
                setProgress(currentTime / duration);
                setcurtime(formatTime(currentTime));
            }
        });

        wavesurfer.current.on("seek", (e) => {
            setcurtime(formatTime(e * wavesurfer.current?.getDuration()));
        });

        wavesurfer.current.on("finish", () => {
            wavesurfer.current?.seekTo(0);
        });

        // Expose globally (optional)
        if (typeof window !== "undefined") {
            window.surferidze = wavesurfer.current;
        }

    }, [setduration, setIsTrackLoading, setProgress, setcurtime, setLoadingPercent, theme]);


    // ✅ Stop any currently playing file before starting a new one
    const togglePlay = useCallback(() => {
        if (!wavesurfer.current) return;

        const isPlaying = wavesurfer.current.isPlaying();
        isPlaying ? wavesurfer.current.pause() : wavesurfer.current.play();
        setPlaying(!isPlaying);

        dispatch(
            SET_AI_MUSIC_META({
                playedSSTrack: data?.preview_track_url,
            })
        );
    }, [dispatch, data?.preview_track_url]);

    useEffect(() => {
        if (playedSSTrack !== data?.preview_track_url) {
            wavesurfer.current?.pause();
            setPlaying(false);
        }
    }, [playedSSTrack]);

    // ✅ Fetch waveform on mount
    useEffect(() => {
        fetchFiles();
        return () => {
            if (wavesurfer?.current) {
                wavesurfer.current.destroy();
                wavesurfer.current = null;
                setPlaying(false);
                setcurtime("00:00");
                lastInitializedFileRef.current = null;
            }
        };
    }, []);


    return (
        <div className="cue_variant_block" data-type={data?.type}>
            <div
                className="wavesurfer"
                style={{
                    border:
                        showSelectedHighlighted &&
                            selectedAIMusicDetails?.cue_id &&
                            data?.cue_id == selectedAIMusicDetails?.cue_id
                            ? "1px solid var(--color-primary)"
                            : "none",
                }}
            >
                <div
                    className="header_container"
                    style={{
                        width:
                            type !== "DASHBOARD_BLOCK"
                                ? "calc(100% - 200px)"
                                : "calc(100% - 25px)",
                    }}
                >
                    <p className="track_name boldFamily" data-key={data?.track_name}>
                        {data?.track_name}
                    </p>
                    <div className="track_tags">
                        {hideTrackTags ? (
                            <p className="track_tag">{data?.tempo}</p>
                        ) : (
                            <>
                                {isDevServer && (
                                    <p className="track_tag">{data?.settings?.key}</p>
                                )}
                                {/* <p className="track_tag">{data?.genre}</p> */}
                                <p className="track_tag">{data?.TAGNAME || ""}</p>
                                <p className="track_tag">{data?.tag_tempo || ""}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="main_container">
                    <div
                        className="play_pause_btn"
                        style={{
                            cursor: isTrackLoading ? "progress" : "pointer",
                        }}
                    >
                        <button
                            className="play_pause_cue_icon"
                            disabled={isTrackLoading}
                            onClick={togglePlay}
                        >
                            <IconWrapper
                                icon={!playing ? "BorderedPlay" : "BorderedPause"}
                                className={`ctrlbtn`}
                            />
                            <audio
                                key={data?.preview_track_url}
                                preload="none"
                                autoPlay={false}
                                id="audioTag"
                                type="audio/mpeg"
                                ref={music}
                                src={
                                    audioPlayer
                                        ? audioPlayer
                                        : null
                                }
                            />
                        </button>
                    </div>
                    <div
                        className="wave"
                        style={{
                            width: type !== "DASHBOARD_BLOCK" ? "calc(100% - 210px)" : "98%",
                            position: "relative",
                        }}
                    >
                        <div
                            className="cue_variant_spinner_container"
                            style={{ display: isTrackLoading ? "flex" : "none" }}
                        >
                            <CustomLoaderSpinner
                                style={{
                                    scale: "0.8",
                                    position: "relative",
                                    top: "-6px",
                                }}
                                processPercent={loadingPercent}
                            />
                        </div>
                        <div style={{
                            height: "60px",
                            transition: "background-color 0.3s ease-in-out",
                        }}>
                            <div ref={waveformRef}></div>
                        </div>
                        <div className="timestamp">
                            <p className="curr-time">{curtime}</p>
                            <p className="duration">{duration}</p>
                        </div>
                    </div>
                    {type !== "DASHBOARD_BLOCK" && (
                        <div className="selection">
                            {showSelectedHighlighted &&
                                selectedAIMusicDetails?.cue_id &&
                                data?.cue_id == selectedAIMusicDetails?.cue_id ? (
                                <ButtonWrapper
                                    onClick={() =>
                                        navigate(
                                            getWorkSpacePath(
                                                projectID,
                                                selectedAIMusicDetails?.cue_id
                                            )
                                        )
                                    }
                                    style={{ width: "150px" }}
                                >
                                    Keep Selection
                                </ButtonWrapper>
                            ) : (

                                <ButtonWrapper
                                    onClick={() => {
                                        dispatch(
                                            SET_AI_MUSIC_META({
                                                flaxTrackID: data?.cs_flax_track_id,
                                                isCSTrack,
                                                SSflaxTrackID: data?.cs_flax_track_id || "",
                                            })
                                        );
                                        navigate(NavStrings.FLAX_TRACK, { replace: true });
                                        onTrackSelect()
                                    }
                                    }
                                    style={{ width: "150px" }}
                                    className="primary_border frashlyMadeButton"
                                    disabled={!data?.cs_flax_track_id}
                                >
                                    Use this track
                                </ButtonWrapper>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AITrackCardV1;
