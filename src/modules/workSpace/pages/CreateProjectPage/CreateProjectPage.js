import React from "react";
import useAppType, { APP_TYPES } from "../../../../customHooks/useAppType";
import ProjectSettings from "../ProjectSettingsPage/ProjectSettings";
import { useParams, useSearchParams } from "react-router-dom";
import VoiceOnlyProjectSettings from "../VoiceOnlyProjectSettingsPage/VoiceOnlyProjectSettings";

const CreateProjectPage = () => {
  const { appType } = useAppType();
  let { flax_id } = useParams();
  let flaxId = flax_id ? decodeURIComponent(flax_id) : null;

  const [searchParams] = useSearchParams();
  const isCSTrack = searchParams.get("is-cs-track") === "1";
  const isStabilityTrack = searchParams.get("is-stability-track") === "1";

  if (appType === APP_TYPES.AI_VOICE) {
    return <VoiceOnlyProjectSettings />;
  } else {
    return <ProjectSettings flaxId={flaxId} isCSTrack={isCSTrack} />;
  }
};

export default CreateProjectPage;
