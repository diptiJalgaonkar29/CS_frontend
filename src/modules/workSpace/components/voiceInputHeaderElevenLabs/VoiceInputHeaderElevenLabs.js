import React, { useState } from "react";
import CustomPopover from "../../../../common/components/customPopover/CustomPopover";
import CustomRangeSlider from "../../../../common/components/customRangeSlider/CustomRangeSlider";
import "./VoiceInputHeaderElevenLabs.css";
import CheckboxWrapper from "../../../../branding/componentWrapper/CheckboxWrapper";
import InfoToolTip from "../InfoToolTip/InfoToolTip";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";

const validationSchema = Yup.object({
  addPause: Yup.number()
    .typeError("Must be a number")
    // .integer("Must be an integer")
    .min(1, "Must be at least 1")
    .max(3, "Must be at most 3")
    .required("This field is required"),
});

// "voiceSettingsElevenLabs": {
//     "stability" : "0.5",//Range in between 0 to 1
//     "similarityBoost" : "0.7",//Range in between 0 to 1
//     "style" : "0",////Range in between 0 to 1
//     "useSpeakerBoost" : true
//   }

const VoiceInputHeaderElevenLabs = ({
  index,
  maxSeconds = 3,
  insertBreak,
  updateVoiceMeta,
  voiceMeta,
  inputId,
  content,
}) => {
  const { stability, similarityBoost, style, useSpeakerBoost } = voiceMeta;
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
                insertBreak(inputId, content, index, values.addPause, true);
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
                      step={0.1}
                      min={1}
                      max={maxSeconds}
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

      <div className="custom_tooltip_container">
        <CustomPopover
          renderBtn={
            <button className="voice_tab_header_btn">
              Stability: {Number(stability).toFixed(1)}
            </button>
          }
          popoverContent={
            <CustomRangeSlider
              min={0}
              max={1}
              step={0.1}
              defaultValue={0.5}
              value={+stability}
              name={"stability"}
              onChangeValue={(e) => {
                updateVoiceMeta("stability", e + "", index);
              }}
            />
          }
        />
        <InfoToolTip>
          <div className="voiceInput_tooltip_container">
            <b> Recommended: 0.5</b>
            <p>Controls how expressive the delivery is. </p>
            <p>Low Stability</p>
            <ul>
              <li>More expressive voice and emotional tone.</li>
              <li>
                Best for: Emotional, conversational, or storytelling contexts.
              </li>
            </ul>
            <p>High Stability</p>
            <ul>
              <li>
                More steady voice, with a consistent, sometimes monotonous tone.
              </li>
              <li>
                Best for: Professional, instructional, or formal contexts.
              </li>
            </ul>
          </div>
        </InfoToolTip>
      </div>

      <div className="custom_tooltip_container">
        <CustomPopover
          renderBtn={
            <button className="voice_tab_header_btn">
              Similarity Boost: {Number(similarityBoost).toFixed(1)}
            </button>
          }
          popoverContent={
            <CustomRangeSlider
              min={0}
              max={1}
              step={0.1}
              defaultValue={0.7}
              value={+similarityBoost}
              name={"similarityBoost"}
              onChangeValue={(e) => {
                updateVoiceMeta("similarityBoost", e + "", index);
              }}
            />
          }
        />
        <InfoToolTip>
          <div className="voiceInput_tooltip_container">
            <b>Recommended: 0.7</b>
            <p>
              Controls how similar the delivery is to that of the original
              voice.
            </p>
            <p>Low Similarity Boost</p>
            <ul>
              <li>
                Enhanced clarity of voice, making the speech easier to
                understand.
              </li>
              <li>
                Best for: E-learning, instructional content, or news contexts.
              </li>
            </ul>
            <p>High Similarity Boost</p>
            <ul>
              <li>
                More natural-sounding voice, close to the original speaker’s
                tone, pitch, intonation, and nuances.
              </li>
              <li>Best for: Storytelling or personalized branding.</li>
            </ul>
          </div>
        </InfoToolTip>
      </div>

      <div className="custom_tooltip_container">
        <CustomPopover
          renderBtn={
            <button className="voice_tab_header_btn">
              Style: {Number(style).toFixed(1)}
            </button>
          }
          popoverContent={
            <CustomRangeSlider
              min={0}
              max={1}
              step={0.1}
              defaultValue={0}
              value={+style}
              name={"style"}
              onChangeValue={(e) => {
                updateVoiceMeta("style", e + "", index);
              }}
            />
          }
        />
        <InfoToolTip>
          <div className="voiceInput_tooltip_container">
            <b>Recommended: 0.0</b>
            <p>
              Controls how intensely the speaker’s preexisting style is
              emphasised (i.e. expressiveness)
            </p>
            <p>Low Style</p>
            <ul>
              <li>
                Subtle, neutral delivery with minimal emphasis of the speaker’s
                vocal qualities.
              </li>
              <li>
                Best for: Professional, instructional, or formal contexts.
              </li>
            </ul>
            <p>High Style</p>
            <ul>
              <li>
                Exaggerated expressiveness of the speaker’s vocal qualities
                (e.g. raspiness, breathiness, vocal fry).
              </li>
              <li>
                Best for: Any context where personality is key (e.g. ads).
              </li>
            </ul>
          </div>
        </InfoToolTip>
      </div>

      <div className="custom_tooltip_container">
        <CheckboxWrapper
          label="Use Speaker Boost"
          checked={useSpeakerBoost}
          onChange={(e) => {
            updateVoiceMeta("useSpeakerBoost", e.target.checked, index);
          }}
        />
        <InfoToolTip>
          <div className="voiceInput_tooltip_container">
            <p style={{ marginTop: "-10px" }}>
              Boosts similarity, focusing on precise replication of the original
              speaker at the cost of context-based emotional nuance in delivery.
            </p>
            <p>Speaker Boost Off</p>
            <ul>
              <li>
                Less similarity to the original speaker, context-based delivery
                adaptation (e.g. conveying surprise).
              </li>
              <li>Best for: Contexts prioritising emotional expressiveness.</li>
            </ul>
            <p>Speaker Boost On </p>
            <ul>
              <li>
                Near-identical replication of the original speaker’s vocal
                qualities (e.g. pitch, rhythm, intonation, vocal nuances).
              </li>
              <li>Best for: Contexts prioritising exact voice matching.</li>
            </ul>
          </div>
        </InfoToolTip>
      </div>
    </div>
  );
};

export default VoiceInputHeaderElevenLabs;