import { useEffect, useRef, useState } from "react";

const useSonicLogoTrackPlayPause = () => {
  const audioCommonRef = useRef({});
  const [playingAudio, setPlayingAudio] = useState({
    mp3: "",
    id: "",
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
    if (!playingAudio?.mp3 && !!audioCommonRef.current?.id) {
      audioCommonRef.current?.pause();
      audioCommonRef.current.currentTime = 0;
      return;
    }
    playTrack(playingAudio?.mp3);
  }, [playingAudio?.mp3]);

  async function playTrack(mp3) {
    if (!audioCommonRef.current?.id) return;
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

  const playPause = ({ mp3, id }) => {
    if (mp3 === playingAudio?.mp3 && id === playingAudio?.id) {
      // console.log("Current audio...");

      if (audioCommonRef.current?.paused) {
        audioCommonRef.current?.play();
        setPlayingAudio((prev) => ({
          ...prev,
          isPlaying: true,
        }));
      } else {
        audioCommonRef.current?.pause();
        setPlayingAudio((prev) => ({
          ...prev,
          isPlaying: false,
        }));
      }
    } else {
      // console.log("new audio...");
      audioCommonRef.current?.pause();
      setPlayingAudio({
        mp3,
        isPlaying: false,
        isLoading: false,
        id,
      });
    }
  };
  return { playingAudio, setPlayingAudio, audioCommonRef, playPause };
};
export default useSonicLogoTrackPlayPause;
