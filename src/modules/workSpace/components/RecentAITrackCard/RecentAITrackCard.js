import React, { useEffect, useState } from "react";
import getTrackDetailsByCueID from "../../services/TuneyAIMusic/getTrackDetailsByCueID";
import AITrackCard from "../AITrackCard/AITrackCard";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import { useDispatch, useSelector } from "react-redux";
import { SET_AI_Track_Stability_META } from "../../redux/AITrackStabilitySlice";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";

const RecentAITrackCard = ({ cue, label, index, description, mp3Urls }) => {
  const dispatch = useDispatch();
  const [cueDetails, setCueDetails] = useState(null);
  const { stabilityMP3TracksArr, latestFiledataStability } = useSelector((state) => state.AIMusicStability);
  const { stabilityArr, currentUseThisTrack } = useSelector((state) => state.AITrackStability);
  const { projectID, } = useSelector((state) => state.projectMeta);
  const getCuesDetails = (controller, cueID, label = "") => {
    getTrackDetailsByCueID({
      controller,
      cueID,
      onSuccess: (response) => {
        setCueDetails({ ...response.data, label, desc: description, type: "recentAIGeneratedData" });
        dispatch(
          SET_AI_MUSIC_META({
            selectedAIMusicConfig: {
              mood: response.data?.settings?.mood || "",
              genre: response.data?.settings?.genre || "",
              tempo: response.data?.settings?.tempo || "",
            }
          }))
      },
    });
  };

  const generateBlob = async () => {
    try {
      const fileRequests = mp3Urls.flat().map((file) =>
        axiosCSPrivateInstance.get(
          `/stability/GetMediaFile/${projectID}/${file}`,
          { responseType: "blob" }
        )
      );

      const results = await Promise.all(fileRequests);

      // Create object URLs for each blob
      const objectURLArr = results.map((res) => URL.createObjectURL(res.data));
      console.log("Fetched all Stability MP3 files:", objectURLArr);

      // Dispatch here, where objectURLArr exists
      dispatch(
        SET_AI_Track_Stability_META({ stabilityArr: objectURLArr, currentUseThisTrack: currentUseThisTrack })
      );
    } catch (err) {
      console.error("Failed to generate blob URLs:", err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (mp3Urls?.length > 0) {
      generateBlob();
    } else {
      getCuesDetails(controller, cue, label);
    }
    return () => controller.abort();
  }, [cue, mp3Urls?.length]);


  console.log("stabilityMP3TracksArr", stabilityMP3TracksArr)

  return (
    <div>
      {
        mp3Urls?.length > 0 ? (
          stabilityArr?.slice().reverse().map((url, idx) => {
            return (
              <AITrackCard
                key={idx}
                type="VARIANT_BLOCK"
                stabilityArr={[url]} // Pass as single-item array
                index={idx}
                oldData={stabilityArr}
                mp3Url={stabilityMP3TracksArr.flat().reverse()}
                allDataArr={latestFiledataStability}
              />
            )
          })
        ) : (
          <AITrackCard
            key={`recent_AI_music_${cueDetails?.cue_id}_${index}`}
            type="RECENT_VARIANT_BLOCK"
            data={cueDetails}
            index={index}
            showSelectedHighlighted={true}
          />
        )
      }

    </div>
  );
};

export default RecentAITrackCard;
