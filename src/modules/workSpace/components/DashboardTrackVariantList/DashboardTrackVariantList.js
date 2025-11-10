import React from "react";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import AITrackCard from "../AITrackCard/AITrackCard";
import "./DashboardTrackVariantList.css";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";

const DashboardTrackVariantList = ({
  variantLoading,
  variantsDetails,
  setVariantsDetails,
}) => {
  return (
    <div className="dashboard_variant_container">
      {variantLoading && <CustomLoader />}
      {variantsDetails != null && (
        <>
          {variantsDetails?.length === 0 ? (
            <h1 className="center_align_title">No Variants found</h1>
          ) : (
            <>
              <div className="variant_container">
                <h1 className="left_align_title">Variants</h1>
                {variantsDetails?.map((item, i) => (
                  <LazyLoadComponent
                    className={`track_AI_variant_${i}`}
                    ref={React.createRef()}
                    defaultHeight={150}
                    key={item?.cue_id}
                  >
                    <AITrackCard
                      key={`selected_track_variants_data_${item?.cue_id}_${i}`}
                      type="VARIANT_BLOCK"
                      data={item}
                      index={variantsDetails?.length - i}
                      onTrackSelect={() => {
                        setVariantsDetails(null);
                      }}
                    />
                  </LazyLoadComponent>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardTrackVariantList;
