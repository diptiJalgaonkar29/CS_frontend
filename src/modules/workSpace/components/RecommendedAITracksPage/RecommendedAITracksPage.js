import { useSelector } from "react-redux";
import "./RecommendedAITracksPage.css";
import FreshAITrackVariantPage from "../../pages/FreshAITrackVariantPage/FreshAITrackVariantPage";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import getCSUserMeta from "../../../../utils/getCSUserMeta";

const RecommendedAITracksPage = () => {
  const { freshAITracksVariantsList, aiMusicGeneratorProgress } = useSelector(
    (state) => state.AIMusic
  );
  const { brandMeta } = getCSUserMeta();
  const { stabilityLoading } = useSelector((state) => state.AIMusicStability);
  const { stabilityArr } = useSelector((state) => state.AITrackStability);
  

  return (
    <>
      {(!!aiMusicGeneratorProgress?.id || stabilityLoading) && (
        <div className="no_data_found_ai_tracks">
          <CustomLoaderSpinner />
          <br />
          <br />
          <p>Track analysis is in process...</p>
        </div>
      )}
      {brandMeta?.aiMusicProvider == "stability" ?
        stabilityArr && stabilityArr?.length > 0 ?
          (<FreshAITrackVariantPage addLayout={false} />)
          :
          (stabilityLoading ?
            <></>
            :
            (
            <div className="no_data_found_ai_tracks">
              <p>No track has been generated yet.</p>
            </div>
          ))
        
        :
        freshAITracksVariantsList && freshAITracksVariantsList?.length > 0 ? (
          <FreshAITrackVariantPage addLayout={false} />
        ) : (
          <div className="no_data_found_ai_tracks">
            <p>No track has been generated yet.</p>
          </div>
        )}

    </>
  );
};

export default RecommendedAITracksPage;
