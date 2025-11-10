import { useEffect, useMemo, useRef, useState } from "react";

const AudioTimeline = ({ TTSTimelineVoicesMP3, setIsTimelineReady }) => {
  const [preloadedAudioMap, setPreloadedAudioMap] = useState({});
  const prevKeysRef = useRef(new Set());

  const TTSMp3Memo = useMemo(
    () => TTSTimelineVoicesMP3?.map((data) => data?.mp3),
    [TTSTimelineVoicesMP3]
  );

  const preloadedAudioMapMemo = useMemo(
    () => preloadedAudioMap,
    [preloadedAudioMap]
  );

  useEffect(() => {
    console.log("preloadedAudioMapMemo", preloadedAudioMapMemo);
    console.log("prevKeysRef", prevKeysRef);
  }, [preloadedAudioMapMemo]);

  useEffect(() => {
    const fetchAudios = async () => {
      console.log("fetchAudios called.....");
      const newAudioMap = { ...preloadedAudioMap };
      const currentKeys = new Set();
      console.log("newAudioMap Before", newAudioMap);
      console.log("currentKeys Before", currentKeys);
      const fetchPromises = TTSTimelineVoicesMP3?.map(async (element) => {
        const preloadedAudioMapKey = `audio-player-${element.mp3}`;
        currentKeys.add(preloadedAudioMapKey);

        if (!preloadedAudioMap[preloadedAudioMapKey]) {
          try {
            const response = await fetch(element.mp3);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            newAudioMap[preloadedAudioMapKey] = blobUrl;
          } catch (err) {
            console.error("Error preloading audio:", element.mp3, err);
          }
        }
      });
      console.log("newAudioMap after", newAudioMap);
      console.log("currentKeys after", currentKeys);
      // Wait for all new fetches to complete
      await Promise.all(fetchPromises);

      // Remove blob URLs for deleted audios
      prevKeysRef.current.forEach((prevKey) => {
        if (!currentKeys.has(prevKey)) {
          URL.revokeObjectURL(preloadedAudioMap[prevKey]);
          delete newAudioMap[prevKey];
        }
      });

      // Update states
      setPreloadedAudioMap(newAudioMap);
      prevKeysRef.current = currentKeys;
      setIsTimelineReady((prev) => ({ ...prev, voice: true }));
    };

    if (TTSTimelineVoicesMP3.length > 0) {
      setIsTimelineReady((prev) => ({ ...prev, voice: false }));
      fetchAudios();
    }
  }, [TTSMp3Memo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(preloadedAudioMap).forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);

  if (!TTSTimelineVoicesMP3 || TTSTimelineVoicesMP3?.length === 0) return;

  return (
    <div id="mp3_container">
      {TTSTimelineVoicesMP3?.map((element) => {
        const key = `audio-player-${element.startPoint}-${element.duration}`;
        const preloadedAudioMapKey = `audio-player-${element.mp3}`;
        return (
          <audio
            key={key}
            id={key}
            className="voice-audio"
            src={preloadedAudioMap[preloadedAudioMapKey] || ""}
            type="audio/mp3"
            preload="auto"
          />
        );
      })}
    </div>
  );
};

export default AudioTimeline;
