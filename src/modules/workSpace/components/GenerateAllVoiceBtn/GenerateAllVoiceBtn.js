import React, { useMemo } from "react";
import "./GenerateAllVoiceBtn.css";
import { ADD_NEW_TTS_SCRIPT_IDS } from "../../redux/voicesSlice";
import processTTSV2 from "../../services/voiceExternal/processTTSV2";
import { useDispatch, useSelector } from "react-redux";
import { TTS_STATUS } from "../../constants/TTSStatus";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import countBreakTags from "../../../../utils/countBreakTags";

const GenerateAllVoiceBtn = () => {
  const dispatch = useDispatch();
  const { projectID } = useSelector((state) => state.projectMeta);
  const { selectedVoices } = useSelector((state) => state?.voices);

  const generateAllTTS = async () => {
    // let pendingTTS = selectedVoices
    //   ?.flatMap((data) => data.content)
    //   ?.filter(
    //     (data) =>
    //       !data.mp3 &&
    //       !!data.content &&
    //       data.status === TTS_STATUS.NOT_STARTED &&
    //       !/<break\s+time\s*=\s*"(\d+\.\d+s)"/g.test(data.content)
    //   );
    let pendingTTS = selectedVoices
      ?.flatMap((data) => data.content)
      ?.filter(
        (data) =>
          !data.mp3 &&
          !!data.content &&
          data.status === TTS_STATUS.NOT_STARTED &&
          !countBreakTags(data.content, data.voiceProvider)
      );

    if (pendingTTS?.length === 0) return;

    processTTSV2({
      projectID,
      jobRequest: pendingTTS,
      onSuccess: (res) => {
        let ttsScriptIds = res.data?.map((data) => data?.scriptId);
        dispatch(ADD_NEW_TTS_SCRIPT_IDS(ttsScriptIds));
      },
      onError: () => { },
    });
  };

  const showGenerateVoiceBtn = useMemo(() => {
    return (
      selectedVoices
        ?.flatMap((data) => data.content)
        ?.filter(
          (data) =>
            !data.mp3 &&
            !!data.content &&
            data.status === TTS_STATUS.NOT_STARTED &&
            !countBreakTags(data.content, data.voiceProvider)
        )?.length !== 0
    );
  }, [selectedVoices]);

  return (
    <div className="generate_voice_btn_container">
      <ButtonWrapper
        size="s"
        variant="filled"
        id="generate_voice_btn"
        onClick={generateAllTTS}
        disabled={!showGenerateVoiceBtn}
      >
        Generate voice
      </ButtonWrapper>
    </div>
  );
};

export default GenerateAllVoiceBtn;