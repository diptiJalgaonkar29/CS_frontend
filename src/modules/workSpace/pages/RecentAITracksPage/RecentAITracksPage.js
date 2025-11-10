import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Layout from "../../../../common/components/layout/Layout";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import RecentAITrackCard from "../../components/RecentAITrackCard/RecentAITrackCard";
import "./RecentAITracksPage.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { partition } from "lodash";
import VideoLayoutV2 from "../../../../common/components/VideoLayoutV2/VideoLayoutV2";
import getCSUserMeta from "../../../../utils/getCSUserMeta";

const RecentAITracksPage = () => {
  const { recentAIGeneratedData, selectedAIMusicDetails } = useSelector(
    (state) => state.AIMusic
  );
  const { stabilityMP3TracksArr } = useSelector((state) => state.AIMusicStability);
  let navigate = useNavigate();
  let { brandMeta } = getCSUserMeta();
  let sortedRecentAIGeneratedData = useMemo(() => {
    if (!Array.isArray(recentAIGeneratedData)) return;
    try {
      let [filtered, others] = partition(
        recentAIGeneratedData,
        (data) => data.value === selectedAIMusicDetails?.cue_id
      );
      return [...filtered, ...others];
    } catch (error) {
      console.log("error sorting recent tracks :: ", error);
      return [];
    }
  }, [selectedAIMusicDetails?.cue_id, recentAIGeneratedData]);

  if (!Array.isArray(recentAIGeneratedData)) return;

  console.log("stabilityMP3TracksArr?.flat()?.length", stabilityMP3TracksArr)
  console.log("recentAIGeneratedData?.length", recentAIGeneratedData?.length)

  return (
    <Layout>
      <VideoLayoutV2 hideHeader>
        <div className="recent_music_container">
          {recentAIGeneratedData?.length === 0 && (stabilityMP3TracksArr && stabilityMP3TracksArr.flat().length === 0) ? (
            <div className="recent_music_no_data_container">
              <h1 className="recent_music_no_data_header">
                No Variants Generated...
              </h1>
              <ButtonWrapper onClick={() => navigate(-1)}>Back</ButtonWrapper>
            </div>
          ) : (
            <>
              <h1 className="recent_music_header">Recently Generated Tracks</h1>
              {
                brandMeta?.aiMusicProvider == "stability" ? (
                  <LazyLoadComponent
                    className={`recent_music_item_${stabilityMP3TracksArr?.length}`}
                    ref={React.createRef()}
                    defaultHeight={150}
                    key={`${stabilityMP3TracksArr?.length}_${stabilityMP3TracksArr?.length - 1}`}
                  >
                    <RecentAITrackCard
                      mp3Urls={stabilityMP3TracksArr}
                    />
                  </LazyLoadComponent>
                ) : (
                  sortedRecentAIGeneratedData?.map((cue, index) => (
                    <LazyLoadComponent
                      className={`recent_music_item_${index}`}
                      ref={React.createRef()}
                      defaultHeight={150}
                      key={`${cue?.value}_${index}`}
                    >
                      <RecentAITrackCard
                        cue={cue?.value}
                        label={`${cue?.label}`}
                        index={sortedRecentAIGeneratedData?.length - index}
                        description={cue?.desc}
                      />
                    </LazyLoadComponent>
                  )))}
            </>
          )}
        </div>
      </VideoLayoutV2>
    </Layout>
  );
};

export default RecentAITracksPage;
