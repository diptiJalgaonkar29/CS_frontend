import React, { useEffect, useState } from "react";
import "./OnBrandVoice.css";
import { ReactComponent as NewRightArrow } from "../../../../static/common/NewRightArrow.svg";
import getTTSOnBrandVoicesV2 from "../../../workSpace/services/voiceExternal/getTTSOnBrandVoicesV2";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";

const OnBrandVoice = () => {
  const [onBrandVoiceData, setonBrandVoiceData] = useState([]);
  const [onBrandVoiceLoading, setOnBrandVoiceLoading] = useState(true);
  // console.log("onBrandVoiceData",onBrandVoiceData)
  useEffect(() => {
    getTTSOnBrandVoicesV2({
      onSuccess: (res) => {
        // console.log("onBrandData", res.data.voiceData);
        setonBrandVoiceData(res.data.voiceData);
        setOnBrandVoiceLoading(false);
      },
      onError: (err) => {
        setOnBrandVoiceLoading(false);
      },
    });
  }, []);

  if (onBrandVoiceData?.length === 0 && !onBrandVoiceLoading) {
    return <></>;
  }

  return (
    <>
      <div className="OnBrandVoiceContainer">
        <p className="OnBrandVoice_header">On-Brand Voices</p>
        {onBrandVoiceLoading ? (
          <div className="spinnerWrapper">
            <CustomLoaderSpinner />
          </div>
        ) : onBrandVoiceData?.length === 0 ? (
          <div className="messageContent">No Results Found</div>
        ) : (
          <div className="OnBrandVoice_Box">
            <div className="OnBrandVoice_wrapper">
              {onBrandVoiceData?.map((item, index) => {
                return (
                  <div key={index} className="OnBrandVoice_item">
                    <img
                      src={item.ampvoicePhoto}
                      alt={item.ampDisplayName}
                      className="OnBrandVoice_img"
                    />
                    <p className="OnBrandVoice_name">{item.ampDisplayName}</p>
                  </div>
                );
              })}
            </div>
            {/* <button className="InspectVoiceButton">
           {" "}
           <p>Inspect voices </p>
           <NewRightArrow id="rightArrow_btn" />
         </button> */}
          </div>
        )}
      </div>
    </>
  );
};

export default OnBrandVoice;
