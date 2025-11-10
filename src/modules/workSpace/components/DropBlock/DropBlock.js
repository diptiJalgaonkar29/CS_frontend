import { useEffect, useState } from "react";
import "./DropBlock.css";
import DropSlider from "../DropSlider/DropSlider";
import { useDispatch, useSelector } from "react-redux";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
// import RadioWrapper from "../../../../branding/componentWrapper/RadioWrapper";
// import { Formik, Field } from "formik";

const DropBlock = ({ onRemoveLogoClicked }) => {
  const dispatch = useDispatch();
  const { endingOption, isDrop, isDropSliderVisible, sonicLogoId } =
    useSelector((state) => state.AIMusic);
  const { sonicLogoRecommendedTracks, isFetched } = useSelector(
    (state) => state.sonicLogoTrack
  );

  let endingBtnArr = [
    // { label: "Fade out", value: "fade_out", isDisabled: !!sonicLogoId },
    // { label: "Short", value: "short", isDisabled: !!sonicLogoId },
    // { label: "Short", value: "short", isDisabled: true },
    sonicLogoRecommendedTracks?.length > 0
      ? {
          label: !sonicLogoId ? "Add Sonic Logo" : "Edit Sonic Logo",
          value: "add_sonic_logo",
          // isDisabled: !!sonicLogoId,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="drop_container">
      {isDropSliderVisible && <DropSlider />}
      <div className="drop_selection_container">
        {/* <Formik
          initialValues={{
            isDropSelected: isDrop ? "Drop" : "No drop",
          }}
          enableReinitialize={true}
        >
          {(props) => {
            const {
              values,
              dirty,
              isValid,
              isSubmitting,
              touched,
              errors,
              handleSubmit,
              setSubmitting,
              setFieldValue,
            } = props;
            return (
              <form onSubmit={handleSubmit}>
                <div
                  className="drop_radio_container"
                  key={`drop_radio_container_${isDrop}`}
                >
                  <Field
                    type="radio"
                    name="isDropSelected"
                    value="No drop"
                    component={RadioWrapper}
                    label="No drop"
                    id="drop_block_no_drop"
                    onChange={(e) => {
                      setFieldValue("isDropSelected", "No drop");
                      dispatch(
                        SET_AI_MUSIC_META({
                          isDrop: e?.target?.value === "Drop",
                        })
                      );
                    }}
                  />
                  <Field
                    type="radio"
                    name="isDropSelected"
                    value="Drop"
                    component={RadioWrapper}
                    label="Drop"
                    id="drop_block_drop"
                    onChange={(e) => {
                      setFieldValue("isDropSelected", "Drop");
                      dispatch(
                        SET_AI_MUSIC_META({
                          isDrop: e?.target?.value === "Drop",
                        })
                      );
                    }}
                  />
                </div>
              </form>
            );
          }}
        </Formik> */}
        <div className="drop_selection_left_container">
          <ButtonWrapper
            size="s"
            className={`${
              isDropSliderVisible || isDrop ? "drop_selection_active" : ""
            }`}
            onClick={() => {
              dispatch(
                SET_AI_MUSIC_META({
                  isDropSliderVisible: !isDropSliderVisible,
                })
              );
            }}
          >
            {isDrop ? "Edit Drop" : "Add Drop"}
          </ButtonWrapper>
          {/* {isDrop && ( */}
          <p className="drop_hint">
            Move the slider to set the drop and apply changes to remix.
          </p>
        </div>
        {/* )} */}
        {endingBtnArr?.length > 0 && (
          <div
            className="ending_option_container"
            key={`ending_option_container${endingOption}`}
          >
            <p>Ending:</p>
            {endingBtnArr?.map(({ label, value, isDisabled }) => (
              <ButtonWrapper
                key={label}
                size="s"
                className={`${
                  endingOption === value ? "selected" : "not_selected"
                }`}
                disabled={isDisabled}
                onClick={() => {
                  dispatch(
                    SET_AI_MUSIC_META({
                      // endingOption: value,
                      endingOption: endingOption !== value ? value : "",
                    })
                  );
                }}
              >
                {label}
              </ButtonWrapper>
            ))}
            {console.log("sonicLogoId##", sonicLogoId)}
            {sonicLogoId && sonicLogoId !== "null" && sonicLogoId !== "" && (
              <ButtonWrapper
                key="Remove Sonic Logo"
                size="s"
                onClick={onRemoveLogoClicked}
              >
                Remove Sonic Logo
              </ButtonWrapper>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropBlock;
