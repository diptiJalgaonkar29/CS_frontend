import React from "react";
import {
  WppIconEdit,
  WppIconSearch,
  WppIconClose,
  WppIconInfo,
  WppIconChevron,
  WppIconTrash,
  WppIconUpload,
  WppIconPlay,
  WppIconPause,
  WppIconSpeaker,
  WppIconSpeakerMute,
  WppIconLogout,
  WppIconMusic,
  WppIconUser,
  WppIconVideoClip,
  WppIconMore,
  WppIconDataViewList,
  WppIconGrid,
  WppIconArchive,
  WppIconBookmark,
  WppIconBookmarkFilled,
  WppIconPeople,
  WppIconCase,
  WppIconSupport,
  WppIconUndo,
  WppIconRedo,
  WppIconReset,
  WppIconLike,
  WppIconDislike,
  WppIconCopy,
  WppIconHelp,
  WppIconFolder,
} from "@wppopen/components-library-react";

import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import { BsExclamation, BsCheck } from "react-icons/bs";

import { ReactComponent as SonicMasks } from "../../../../static/voice/masks.svg";
import { ReactComponent as SonicMic } from "../../../../static/voice/mic.svg";
import { ReactComponent as SonicVideo } from "../../../../static/common/video.svg";
import { ReactComponent as SonicMusicFile } from "../../../../static/common/music_files.svg";
import { ReactComponent as SonicAIMusic } from "../../../../static/AI_music/AI_music.svg";
import { ReactComponent as SonicAddBordered } from "../../../../static/common/add_border.svg";


const WPPUpArrowIcon = () => {
  return <WppIconChevron direction="up"></WppIconChevron>;
};

const WPPDownArrowIcon = () => {
  return <WppIconChevron direction="down"></WppIconChevron>;
};

const WPPRightArrowIcon = () => {
  return <WppIconChevron direction="right"></WppIconChevron>;
};

const WPPLeftArrowIcon = () => {
  return <WppIconChevron direction="left"></WppIconChevron>;
};

export default {
  Logout: WppIconLogout,
  Play: PlayIcon,
  Pause: PauseIcon,
  BorderedPlay: WppIconPlay,
  BorderedPause: WppIconPause,
  Voice: WppIconUser,
  Music: WppIconMusic,
  VideoClip: WppIconVideoClip,
  Edit: WppIconEdit,
  More: WppIconMore,
  Trash: WppIconTrash,
  Search: WppIconSearch,
  ListView: WppIconDataViewList,
  GridView: WppIconGrid,
  Archive: WppIconArchive,
  Info: WppIconInfo,
  Speaker: WppIconSpeaker,
  SpeakerMute: WppIconSpeakerMute,
  Bookmark: WppIconBookmark,
  BookmarkFilled: WppIconBookmarkFilled,
  Language: WppIconCase,
  Accent: WppIconSupport,
  Age: WppIconPeople,
  Undo: WppIconUndo,
  Redo: WppIconRedo,
  Process: WppIconReset,
  Upload: WppIconUpload,
  ThumbsUp: WppIconLike,
  ThumbsDown: WppIconDislike,

  LeftArrow: WPPLeftArrowIcon,
  RightArrow: WPPRightArrowIcon,
  UpArrow: WPPUpArrowIcon,
  DownArrow: WPPDownArrowIcon,

  Close: WppIconClose,
  Copy: WppIconCopy,
  Check: BsCheck,
  Exclamation: BsExclamation,
  Help: WppIconHelp,
  Profile: WppIconUser,
  Mic: SonicMic,
  Masks: SonicMasks,
  AIMusic: SonicAIMusic,
  MusicFile: SonicMusicFile,
  Video: SonicVideo,
  AddBordered: SonicAddBordered,
  Folder: WppIconFolder,
};
