import { ReactComponent as SonicIconLogout } from "../../../../static/common/logout.svg";
import { ReactComponent as SonicIconPlay } from "../../../../static/common/play.svg";
import { ReactComponent as SonicRightArrow } from "../../../../static/common/rightArrow.svg";
import { ReactComponent as SonicIconPause } from "../../../../static/common/pause.svg";
import { ReactComponent as SonicIconUser } from "../../../../static/Timeline/timeline-voice.svg";
import { ReactComponent as SonicIconMusic } from "../../../../static/Timeline/timeline-music.svg";
import { ReactComponent as SonicIconVideoClip } from "../../../../static/Timeline/timeline-video.svg";
import { ReactComponent as SonicIconEdit } from "../../../../static/common/edit.svg";
import { ReactComponent as SonicIconDelete } from "../../../../static/common/delete.svg";
import { ReactComponent as SonicIconSearch } from "../../../../static/common/search.svg";
import { ReactComponent as SonicIconDataViewList } from "../../../../static/projects_Page/lineView.svg";
import { ReactComponent as SonicIconGrid } from "../../../../static/projects_Page/gridView.svg";
import { ReactComponent as SonicIconArchive } from "../../../../static/projects_Page/archive.svg";
import { ReactComponent as SonicIconInfo } from "../../../../static/voice/info.svg";
import { ReactComponent as SonicIconSpeaker } from "../../../../static/voice/speaker.svg";
import { ReactComponent as SonicIconBookmarkFilled } from "../../../../static/voice/bookmark.svg";
import { ReactComponent as SonicIconBookmark } from "../../../../static/voice/unbookmark.svg";
import { ReactComponent as SonicIconLanguage } from "../../../../static/voice/language.svg";
import { ReactComponent as SonicIconAccent } from "../../../../static/voice/accent.svg";
import { ReactComponent as SonicIconAge } from "../../../../static/voice/age.svg";
import { ReactComponent as SonicIconUndo } from "../../../../static/common/undo.svg";
import { ReactComponent as SonicIconRedo } from "../../../../static/common/redo.svg";
import { ReactComponent as SonicIconUpload } from "../../../../static/common/upload.svg";
import { ReactComponent as SonicIconThumbsDown } from "../../../../static/common/thumbsDown.svg";
import { ReactComponent as SonicIconThumbsUp } from "../../../../static/common/thumbsUp.svg";
import { ReactComponent as SonicIconCopy } from "../../../../static/common/copy.svg";
import { ReactComponent as SonicIconClose } from "../../../../static/common/close.svg";
import { ReactComponent as SonicIconFolder } from "../../../../static/common/folder.svg";
import { ReactComponent as SonicHelp } from "../../../../static/common/help.svg";
import { ReactComponent as SonicProfile } from "../../../../static/common/profile.svg";
import { ReactComponent as SonicMasks } from "../../../../static/voice/masks.svg";
import { ReactComponent as SonicMic } from "../../../../static/voice/mic.svg";

import { ReactComponent as SonicSoundEdit } from "../../../../static/voice/sound_edit.svg";
import { ReactComponent as SonicAddBordered } from "../../../../static/common/add_border.svg";
import { ReactComponent as SonicVideo } from "../../../../static/common/video.svg";
import { ReactComponent as SonicMusicFile } from "../../../../static/common/music_files.svg";
import { ReactComponent as SonicAIMusic } from "../../../../static/AI_music/AI_music.svg";
import { ReactComponent as SonicInfoIcon } from "../../../../static/Export/infoIcon.svg";

import { AiOutlineMore } from "react-icons/ai";
import { BsExclamation, BsCheck } from "react-icons/bs";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import { PiArrowClockwiseBold } from "react-icons/pi";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";

const SonicUpArrowIcon = () => {
  return <SonicRightArrow style={{ transform: "rotate(270deg)" }} />;
};

const SonicDownArrowIcon = () => {
  return <SonicRightArrow style={{ transform: "rotate(90deg)" }} />;
};

const SonicRightArrowIcon = () => {
  return <SonicRightArrow />;
};

const SonicLeftArrowIcon = () => {
  return <SonicRightArrow style={{ transform: "rotate(180deg)" }} />;
};

export default {
  LeftArrow: SonicLeftArrowIcon,
  RightArrow: SonicRightArrowIcon,
  UpArrow: SonicUpArrowIcon,
  DownArrow: SonicDownArrowIcon,
  Logout: SonicIconLogout,
  Play: PlayIcon,
  Pause: PauseIcon,
  BorderedPlay: SonicIconPlay,
  BorderedPause: SonicIconPause,
  Voice: SonicIconUser,
  Music: SonicIconMusic,
  VideoClip: SonicIconVideoClip,
  Edit: SonicIconEdit,
  More: AiOutlineMore,
  Trash: SonicIconDelete,
  Search: SonicIconSearch,
  ListView: SonicIconDataViewList,
  GridView: SonicIconGrid,
  Archive: SonicIconArchive,
  Info: SonicIconInfo,
  Speaker: HiOutlineSpeakerWave,
  SpeakerMute: HiOutlineSpeakerXMark,
  Bookmark: SonicIconBookmark,
  BookmarkFilled: SonicIconBookmarkFilled,
  Language: SonicIconLanguage,
  Accent: SonicIconAccent,
  Age: SonicIconAge,
  Undo: SonicIconUndo,
  Redo: SonicIconRedo,
  Process: PiArrowClockwiseBold,
  Upload: SonicIconUpload,
  ThumbsUp: SonicIconThumbsUp,
  ThumbsDown: SonicIconThumbsDown,
  Close: SonicIconClose,
  Copy: SonicIconCopy,
  Check: BsCheck,
  Exclamation: BsExclamation,
  Help: SonicHelp,
  Profile: SonicProfile,
  Mic: SonicMic,
  Masks: SonicMasks,
  AddBordered: SonicAddBordered,
  SoundEdit: SonicSoundEdit,
  AIMusic: SonicAIMusic,
  MusicFile: SonicMusicFile,
  Video: SonicVideo,
  Folder: SonicIconFolder,
  Info: SonicInfoIcon,
};
