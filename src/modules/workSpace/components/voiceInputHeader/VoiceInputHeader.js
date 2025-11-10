import React, { useState } from "react";
import CustomPopover from "../../../../common/components/customPopover/CustomPopover";
import CustomRangeSlider from "../../../../common/components/customRangeSlider/CustomRangeSlider";
import "./VoiceInputHeader.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import SpeakingStylePopover from "../SpeakingStylePopover/SpeakingStylePopover";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  addPause: Yup.number()
    .typeError("Must be a number")
    .integer("Must be an integer")
    .min(1, "Must be at least 1")
    .max(9, "Must be at most 9")
    .required("This field is required"),
});

const VoiceInputHeader = ({
  speed,
  onSpeedChange,
  onVoiceTabHeaderChangeSpeakingStyleValue,
  selectedSpeakingStyle,
  inputId,
  content,
  index,
  insertBreak,
  voiceId,
}) => {
  const [isPopoverClosed, setIsPopoverClosed] = useState(false);

  return (
    <div className="voice_tab_header_container">
      <CustomPopover
        renderBtn={
          <button className="voice_tab_header_btn">Insert Pause</button>
        }
        popoverContent={
          <div className="add_Pause_wrapper">
            <Formik
              initialValues={{ addPause: 1 }}
              validationSchema={validationSchema}
              validateOnChange
              onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                insertBreak(inputId, content, index, values.addPause);
                setSubmitting(false);
                setIsPopoverClosed(true);
              }}
            >
              {({ handleSubmit, isValid, isSubmitting }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="add_Pause_container">
                    <Field
                      type="number"
                      name="addPause"
                      step={1}
                      min={1}
                      max={9}
                      id="addPause"
                    />
                    <p style={{ margin: 0 }}>s</p>
                  </div>
                  <ButtonWrapper
                    variant="filled"
                    type="submit"
                    size="s"
                    style={{ marginTop: "10px" }}
                    disabled={isSubmitting || !isValid}
                  >
                    Insert Pause
                  </ButtonWrapper>
                </Form>
              )}
            </Formik>
          </div>
        }
        closePopover={isPopoverClosed}
      />
      <CustomPopover
        renderBtn={
          <button className="voice_tab_header_btn">Speed : {+speed}</button>
        }
        popoverContent={
          <CustomRangeSlider
            min={-100}
            max={200}
            step={1}
            defaultValue={1}
            value={+speed}
            name={"speed"}
            // datalist={
            //   [
            // { value: -100, label: "-100" },
            // { value: 0, label: "1" },
            // { value: 100, label: "100" },
            // { value: 200, label: "200" },
            //   ]
            // }
            onChangeValue={(e) => {
              onSpeedChange(e);
            }}
          />
        }
      />
      <SpeakingStylePopover
        voiceId={voiceId}
        selectedSpeakingStyle={selectedSpeakingStyle}
        onVoiceTabHeaderChangeSpeakingStyleValue={
          onVoiceTabHeaderChangeSpeakingStyleValue
        }
      />
    </div>
  );
};

export default VoiceInputHeader;
