import { useEffect, useRef, useState } from "react";

const useTTSProcessedVoicePlayPause = () => {
  const audioCommonRef = useRef({});
  const [playingAudio, setPlayingAudio] = useState({
    mp3: "",
    voiceUUID: "",
    playingIndex: "",
    isPlaying: false,
    isLoading: false,
  });

  useEffect(() => {
    setPlayingAudio({});
    return () => {
      setPlayingAudio({});
    };
  }, []);

  useEffect(() => {
    if (!playingAudio?.mp3) return;
    playTrack(playingAudio?.mp3);
  }, [playingAudio?.mp3, playingAudio?.playingIndex]);

  async function playTrack(mp3) {
    audioCommonRef.current.pause();
    audioCommonRef.current.currentTime = 0;
    audioCommonRef.current.src = mp3;
    setTimeout(() => {
      audioCommonRef.current.play().catch((err) => {
        console.log(err, "Audio play was prvented");
      });
    }, 120);
  }

  useEffect(() => {
    setPlayingAudio((prev) => ({
      ...prev,
      isPlaying: !audioCommonRef.current?.paused,
    }));
  }, [audioCommonRef.current?.paused]);

  const playPause = ({ mp3, voiceUUID, index, voiceIndex }) => {
    if (
      mp3 === playingAudio?.mp3 &&
      `${voiceIndex}-${index}` === playingAudio?.playingIndex
    ) {
      if (audioCommonRef.current?.paused) {
        audioCommonRef.current.play();
        // console.log("playing...");
        setPlayingAudio((prev) => ({
          ...prev,
          isPlaying: true,
        }));
      } else {
        audioCommonRef.current.pause();
        // console.log("pause...");
        setPlayingAudio((prev) => ({
          ...prev,
          isPlaying: false,
        }));
      }
    } else {
      // console.log("new load...");
      setPlayingAudio({
        mp3,
        voiceUUID,
        isPlaying: !audioCommonRef.current?.paused,
        isLoading: true,
        playingIndex: `${voiceIndex}-${index}`,
      });
    }
  };

  return { playingAudio, setPlayingAudio, audioCommonRef, playPause };
};
export default useTTSProcessedVoicePlayPause;
