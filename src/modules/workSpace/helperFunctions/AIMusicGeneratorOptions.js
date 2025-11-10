import { FormattedMessage } from "react-intl";

const AIMusicGeneratorOptions = [
  {
    key: "video",
    icon: "Video",
    title: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithVideoTitle"}
      />
    ),
    subTitle: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithVideoSubtitle"}
      />
    ),
  },
  {
    key: "brief",
    icon: "MusicFile",
    title: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithBriefTitle"}
      />
    ),
    subTitle: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithBriefSubtitle"}
      />
    ),
  },
  {
    key: "tags",
    icon: "AIMusic",
    title: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithTagsTitle"}
      />
    ),
    subTitle: (
      <FormattedMessage
        id={"workspace.AIMusicGenerator.GenerateMusicWithTagsSubtitle"}
      />
    ),
  },
];

export default AIMusicGeneratorOptions;
