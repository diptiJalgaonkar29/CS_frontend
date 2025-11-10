import _ from "lodash";
import wppThemeData from "../themejsons/wpp.json";

let wppThemeDataL = wppThemeData.content.light;

const addBrandFont = () => {
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", wppThemeData.settings.fontUrl);
  document.head.appendChild(link);
};
addBrandFont();

export default {
  "--color-bg": _.get(
    wppThemeDataL,
    _.get(wppThemeData, "content.light.surface.bgColor")
  ),
  "--color-error": wppThemeDataL.color.dataviz.seq.negative[400],
  "--color-success": wppThemeDataL.color.dataviz.seq.positive[400],
  "--color-warning": wppThemeDataL.color.dataviz.seq.warning[400],
  "--color-wave-progress": "#A2D2A2",
  "--color-wave-bg": wppThemeDataL.color.grey[700],
  "--color-primary": wppThemeDataL.color.primary[500],
  "--color-primary-shade1": wppThemeDataL.color.primary[600],
  "--color-primary-shade2": wppThemeDataL.color.primary[400],
  "--color-primary-shade3": wppThemeDataL.color.primary[300],
  "--color-primary-shade4": wppThemeDataL.color.primary[200],
  "--color-white": "#000000",
  "--color-black": "#000000",
  "--color-secondary": wppThemeDataL.color.grey[300],
  "--color-secondary-shade1": "#1E2023",
  "--color-secondary-shade2": "#54565A",
  "--color-secondary-shade3": "#636569",
  "--color-secondary-shade4": "#D0CFCD",
  "--color-secondary-shade5": "#F3F3F3",
  "--color-secondary-shade6": "#797979",
  "--color-secondary-shade7": "#1B1D1F",
  "--color-secondary-shade8": "#757575",
  "--color-secondary-shade9": "#333538",
  "--color-secondary-shade10": "#121212",
  "--color-secondary-shade11": "#797979",
  "--color-secondary-shade12": "#4C4C4C",
  "--color-icon": "#000",
  "--color-icon-active": "#000",
  "--color-icon-inactive": "#757575",
  "--color-lightgray": "#666666",
  "--browse-background-color": "#000000",
  "--color-loader": wppThemeDataL.color.grey[900],
  "--color-male-voice": "#68E3B6",
  "--color-female-voice": "#F19AFF",
  "--font-primary": wppThemeDataL.font.family,
  "--font-primary-light": wppThemeDataL.font.family,
  "--font-primary-medium": wppThemeDataL.font.family,
  "--font-primary-bold": wppThemeDataL.font.family,
  "--color-donutchart-primary": "#cf6175",
  "--color-donutchart-secondary": "#af5c86",
  "--color-donutchart-tertiary": "#865b8c",
  "--color-donutchart-quaternary": "#5e5883",
  "--color-donutchart-quinary": "#3e5270",
  "--color-donutchart-senary": "#2f4858",

  "--color-voice-1": "rgb(0,124,146)",
  "--color-voice-2": "rgb(0,176,202)",
  "--color-voice-3": "rgb(94,36,80)",
  "--color-voice-4": "rgb(156,42,160)",
  "--color-voice-5": "rgb(168,180,60)",
  "--color-voice-6": "rgb(235,151,0)",
  "--color-voice-7": "rgb(254,203,0)",
  "--color-voice-8": "rgb(0,0,0)",

  "--color-voice-9": "rgb(0,99,117)",
  "--color-voice-10": "rgb(0,141,162)",
  "--color-voice-11": "rgb(75,29,64)",
  "--color-voice-12": "rgb(125,34,128)",
  "--color-voice-13": "rgb(134,144,48)",
  "--color-voice-14": "rgb(188,121,0)",

  "--color-voice-15": "rgb(0,149,175)",
  "--color-voice-16": "rgb(0,211,242)",
  "--color-voice-17": "rgb(113,43,96)",
  "--color-voice-18": "rgb(187,50,192)",
  "--color-voice-19": "rgb(202,216,72)",
  "--color-voice-20": "rgb(255,181,0)",
};
