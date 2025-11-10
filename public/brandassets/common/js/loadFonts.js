let superBrandId = localStorage.getItem("superBrandId");
let superBrandName = localStorage.getItem("superBrandName");

const getBrandAssetBaseUrl = () => {
  let origin = document.location.origin;
  const brandassetsFolderName =
    localStorage.getItem("brandassetsFolderName") || superBrandId;
  return `${origin}/brandassets/${brandassetsFolderName}`;
};

const loadConfigJson = async () => {
  const brandAssetBaseUrl = getBrandAssetBaseUrl();
  let commonConfigUrl = `${brandAssetBaseUrl}/json/config.json?t=${Date.now()}`;

  console.log("loadConfigJson- config URL: ", commonConfigUrl);

  let commonConfig = {};
  if (!!commonConfigUrl) {
    const response = await fetch(commonConfigUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    const data = await response.json();
    commonConfig = { data };
  }
  console.log("commonConfig.data", commonConfig.data);
  let findresponse = { ...commonConfig.data };

  console.log("loadConfigJson- findresponse ", findresponse);
  return findresponse;
};

const fetchFont = async (lightFontPath, mediumFontPath, boldFontPath) => {
  const brandAssetBaseUrl = getBrandAssetBaseUrl();
  const lightFontUrl = `${brandAssetBaseUrl}${lightFontPath}`;
  const mediumFontUrl = `${brandAssetBaseUrl}${mediumFontPath}`;
  const boldFontUrl = `${brandAssetBaseUrl}${boldFontPath}`;
  try {
    const style = document.createElement("style");
    style.innerHTML = `
    @font-face {
      font-family: 'font-light';
      src: url('${lightFontUrl}') format('truetype'); 
    }
    @font-face {
      font-family: 'font-medium';
      src: url('${mediumFontUrl}') format('truetype'); 
    }
    @font-face {
      font-family: 'font-bold';
      src: url('${boldFontUrl}') format('truetype'); 
    }
  `;
    document.head.appendChild(style);
    const root = document.documentElement;
    root.style.setProperty("--font-primary", `font-medium`);
    root.style.setProperty("--font-primary-bold", `font-bold`);
    root.style.setProperty("--font-primary-light", `font-light`);
  } catch (error) {
    console.log("Error loading the font file:", error);
  }
};

(async () => {
  console.log("loadFonts Loaded");
  try {
    let jsonConfig = await loadConfigJson();
    console.log("jsonConfig***", jsonConfig);
    const { LIGHT_FONT_PATH, MEDIUM_FONT_PATH, BOLD_FONT_PATH } = jsonConfig;
    fetchFont(LIGHT_FONT_PATH, MEDIUM_FONT_PATH, BOLD_FONT_PATH);
  } catch (error) {
    console.error("error", error);
  }
})();
