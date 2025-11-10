// Mood asstes
import Fun from "../../../static/Mood_And_Genre/Mood/Fun.png";
import Inspirational from "../../../static/Mood_And_Genre/Mood/Inspirational.png";
import Light from "../../../static/Mood_And_Genre/Mood/Light.png";
import Epic from "../../../static/Mood_And_Genre/Mood/Epic.png";
import Dark from "../../../static/Mood_And_Genre/Mood/Dark.png";

// Genre asstes
import HipHop from "../../../static/Mood_And_Genre/Genre/Hip Hop.png";
import ChillOut from "../../../static/Mood_And_Genre/Genre/Chill out.png";
import Cinematic from "../../../static/Mood_And_Genre/Genre/Cinematic.png";
import Electronic from "../../../static/Mood_And_Genre/Genre/Electronic.png";
import Funk from "../../../static/Mood_And_Genre/Genre/Funk.png";
import House from "../../../static/Mood_And_Genre/Genre/House.png";
import LoFi from "../../../static/Mood_And_Genre/Genre/Lo fi.png";
import Pop from "../../../static/Mood_And_Genre/Genre/Pop.png";
import Rock from "../../../static/Mood_And_Genre/Genre/Rock.png";
import Meditation from "../../../static/Mood_And_Genre/Genre/Meditation.png";
import RAndB from "../../../static/Mood_And_Genre/Genre/R and B.png";
import Default from "../../../static/Mood_And_Genre/Genre/Default config.png";
import Kpop from "../../../static/Mood_And_Genre/Genre/Kpop.png";
import Latin from "../../../static/Mood_And_Genre/Genre/Latin.png";
import capitalizeFirstLetter from "../../../utils/capitalizeFirstLetter";

let genreTags = [
  {
    key: "hip-hop",
    label: "Hip Hop",
    icon: HipHop,
  },
  { key: "electronic", label: "Electronic", icon: Electronic },
  { key: "chill out", label: "Chill out", icon: ChillOut },
  { key: "pop", label: "Pop", icon: Pop },
  { key: "lo fi", label: "Lo fi", icon: LoFi },
  { key: "cinematic_sparse,cinematic", label: "Cinematic", icon: Cinematic },
  { key: "funk", label: "Funk", icon: Funk },
  { key: "house", label: "House", icon: House },
  { key: "rock", label: "Rock", icon: Rock },
  { key: `r&b,r'n'b`, label: "R&B", icon: RAndB },
  { key: "meditation", label: "Meditation", icon: Meditation },
  { key: "kpop", label: "Kpop", icon: Kpop },
  { key: "latin", label: "Latin", icon: Latin },
];

let tempoTags = [
  {
    key: "slow",
    label: "Slow",
  },
  { key: "fast", label: "Fast" },
  { key: "random", label: "Random" },
];

export const getTagMeta = (tag, type) => {
  switch (type) {
    case "MOOD":
      return getMoodTagMeta(tag);
    case "GENRE":
      return getGenreTagMeta(tag);
    case "TEMPO":
      return getTempoTagMeta(tag);

    default:
      return "";
  }
};

export const getTempoTagMeta = (tempo) => {
  if (!tempo) {
    console.log("tempo not found");
    return;
  }

  return (
    tempoTags.find((tag) => tag.key?.split(",")?.includes(tempo)) || {
      label: capitalizeFirstLetter(tempo),
    }
  );
};

export const getGenreTagMeta = (genre) => {
  if (!genre) {
    console.log("genres not found");
    return;
  }

  return (
    genreTags.find((tag) => tag.key?.split(",")?.includes(genre)) || {
      label: capitalizeFirstLetter(genre),
      icon: Default,
    }
  );
};

let moodTags = [
  {
    key: "fun",
    label: "Fun",
    icon: Fun,
  },
  { key: "inspirational", label: "Inspirational", icon: Inspirational },
  { key: "light", label: "Light", icon: Light },
  { key: "epic", label: "Epic", icon: Epic },
  { key: "dark", label: "Dark", icon: Dark },
];

export const getMoodTagMeta = (mood) => {
  if (!mood) {
    console.log("moods not found");
    return;
  }
  return (
    moodTags.find((tag) => tag.key?.split(",")?.includes(mood)) || {
      label: capitalizeFirstLetter(mood),
      icon: Default,
    }
  );
};
