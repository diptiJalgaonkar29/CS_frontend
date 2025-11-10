import loadConfigJson from "../utils/loadConfigJson";
import getSuperBrandName from "../utils/getSuperBrandName";
import { ASSET_PATHS, getBrandAssetPath } from "../utils/getBrandAssetMeta";
import getSuperBrandId from "../utils/getSuperBrandId";
import axios from "axios";

const fetchFont = async () => {
  const lightFontUrl = `${getBrandAssetPath(ASSET_PATHS.LIGHT_FONT_PATH)}`;
  const mediumFontUrl = `${getBrandAssetPath(ASSET_PATHS.MEDIUM_FONT_PATH)}`;
  const boldFontUrl = `${getBrandAssetPath(ASSET_PATHS.BOLD_FONT_PATH)}`;

  console.log("lightFontUrl", lightFontUrl);
  console.log("mediumFontUrl", mediumFontUrl);
  console.log("boldFontUrl", boldFontUrl);

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
  } catch (error) {
    console.log("Error loading the font file:", error);
  }
};

const fetchStyle = () => {
  return new Promise((resolve, reject) => {
    try {
      const cssUrl = getBrandAssetPath(ASSET_PATHS.CSS_PATH);
      console.log("cssUrl", cssUrl);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssUrl;
      link.type = "text/css";

      link.onload = () => {
        console.log("Style loaded:", cssUrl);
        resolve();
      };

      link.onerror = (err) => {
        console.error("Error loading the CSS file:", err);
        reject(new Error(`CSS file not found at: ${cssUrl}`));
      };

      document.head.appendChild(link);
    } catch (error) {
      reject(error);
    }
  });
};

const loadBrandCSS = async (superBrandName) => {
  try {
    let style = await import(`./${superBrandName}/theme/style.css`);
    console.log("Style loaded:", style);
  } catch (error) {
    console.log("error", error);
  }
};

const fetchBrandMeta = async (ssDomainPath) => {
  const response = await axios.get(
    `${ssDomainPath}/api/metaData/getBrandAssets?type=cs`,
    {
      headers: {
        Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
        BrandName: getSuperBrandId(),
        BrandId: localStorage.getItem("brandId"),
      },
    }
  );
  return response?.data;
};

const loadConfigThemeMessages = async () => {
  // const jsonConfig = await loadConfigJson();
  try {
    // throw new Error("Not implemented");

    let redirectUrlLS = localStorage.getItem("redirectUrl");
    let redirectUrl = new URL(redirectUrlLS);
    let ssDomainPath = redirectUrl?.origin;
    if (process.env.NODE_ENV === "development") {
      //ssDomainPath = "http://localhost:3002";
      ssDomainPath = process.env.REACT_APP_DEV_SS_DOMAIN;
    }
    console.log("ssDomainPath", ssDomainPath);
    const brandMeta = await fetchBrandMeta(ssDomainPath);
    window.globalConfig = brandMeta.config;
    console.log("loading css");
    await fetchStyle();
    console.log("loading fonts");
    await fetchFont();

    return {
      modules: brandMeta.module,
      messages: brandMeta.messages,
      theme: brandMeta.theme,
      jsonConfig: brandMeta.config,
    };
  } catch (error) {
    const jsonConfig = await loadConfigJson();
    console.log("Fallback Called : ", error);
    await fetchStyle();
    console.log("loading fonts");
    await fetchFont();
    const themePath = `${
      document.location.origin
    }/brandassetsFallback/json/theme.json?t=${Date.now()}`;
    const messagePath = `${
      document.location.origin
    }/brandassetsFallback/languages/en.json?t=${Date.now()}`;
    const modulesPath = `${
      document.location.origin
    }/brandassetsFallback/json/modules.json?t=${Date.now()}`;

    const [messages, theme, modules] = await Promise.all([
      axios.get(messagePath),
      axios.get(themePath),
      axios.get(modulesPath),
    ]);
    return {
      modules: modules.data,
      messages: messages.data,
      theme: theme.data,
      jsonConfig,
    };
  }
};

class BrandingService {
  async get() {
    let superBrandId = getSuperBrandId();
    try {
      const brandId = localStorage.getItem("brandId");
      if (!!brandId) {
        superBrandId = `${superBrandId}_${brandId}`;
      }
      let brandassetsFolderName = superBrandId;
      console.log("brandassetsFolderName", brandassetsFolderName);
      localStorage.setItem("brandassetsFolderName", brandassetsFolderName);
      return await loadConfigThemeMessages();
    } catch (error) {
      console.log(
        "error while loading brand config,theme and messages...",
        error
      );
      let brandassetsFolderName = getSuperBrandId();
      localStorage.setItem("brandassetsFolderName", brandassetsFolderName);
      return await loadConfigThemeMessages();
    }
  }

  async getWPP() {
    let superBrandName = getSuperBrandName();
    console.log("superBrandName getWPP :: ", superBrandName);

    try {
      // Load brand-specific CSS
      loadBrandCSS(superBrandName);

      // Import static config (local fallback)
      const configModule = await import(`./${superBrandName}/config.js`);
      const localConfig = configModule.default;

      // --- API Call (fetch brand assets) ---
      let redirectUrlLS = localStorage.getItem("redirectUrl");
      let redirectUrl = redirectUrlLS ? new URL(redirectUrlLS) : null;
      let ssDomainPath = redirectUrl?.origin || "";

      if (process.env.NODE_ENV === "development") {
        ssDomainPath = process.env.REACT_APP_DEV_SS_DOMAIN;
      }

      let apiResponse;
      try {
        apiResponse = await axios.get(
          `${ssDomainPath}/api/metaData/getBrandAssets?type=cs`,
          {
            headers: {
              Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
              BrandName: getSuperBrandId(),
              BrandId: 0,
            },
          }
        );
        console.log("✅ API brand meta response:", apiResponse);
      } catch (error) {
        console.warn(
          "⚠️ Failed to load brand API data. Using local config.",
          error
        );
      }

      // --- Merge API data with local config ---
      const apiData = apiResponse?.data || {};

      const finalConfig = {
        ...localConfig,
        theme: apiData.theme || localConfig.theme,
        module: apiData.module || localConfig.module,
        config: apiData.config || localConfig.config,
        messages: apiData.messages || localConfig.messages,
      };

      // Store globally if needed
      window.globalConfig = finalConfig.config;

      return [finalConfig];
    } catch (error) {
      console.error("❌ Error loading brand config:", error);
      return [];
    }
  }
}

export default new BrandingService();
