import { brandConstants } from "./brandConstants";

const getSuperBrandName = () => {
  let LocalStotageBrandName = localStorage.getItem("superBrandName");
  if (!!LocalStotageBrandName) {
    return LocalStotageBrandName;
  }
  const BRAND_DOMAIN = document.location.host;

  let googleDomains = process.env.REACT_APP_GOOGLE_DOMAINS?.split(",");
  let vodafoneDomains = process.env.REACT_APP_VODAFONE_DOMAINS?.split(",");
  let cocacolaDomains = process.env.REACT_APP_COCACOLA_DOMAINS?.split(",");
  let mercedesDomains = process.env.REACT_APP_MERCEDES_DOMAINS?.split(",");
  let mastercardDomains = process.env.REACT_APP_MASTERCARD_DOMAINS?.split(",");
  let shellDomains = process.env.REACT_APP_SHELL_DOMAINS?.split(",");
  let adacDomains = process.env.REACT_APP_ADAC_DOMAINS?.split(",");
  let wppDomains = process.env.REACT_APP_WPP_DOMAINS?.split(",");
  let bcgDomains = process.env.REACT_APP_BCG_DOMAINS?.split(",");
  let intelDomains = process.env.REACT_APP_INTEL_DOMAINS?.split(",");
  let ampDomains = process.env.REACT_APP_AMP_DOMAINS?.split(",");
  let sonicSpaceDomains = process.env.REACT_APP_SONICSPACE_DOMAINS?.split(",");
  let devDomains = process.env.REACT_APP_DEVELOPMENT_DOMAINS?.split(",");
  let sonichub2DemoDomains = process.env.REACT_APP_SONICHUB2_DEMO_DOMAINS?.split(",");
  let sonichub2DevDomains = process.env.REACT_APP_SONICHUB2_DEV_DOMAINS?.split(",");
  let sonichub2WppDomains = process.env.REACT_APP_SONICHUB2_WPP_DOMAINS?.split(",");

  /* function isDomainPresent(domainArray) {
    return domainArray?.some(
      (domain) => !!domain && BRAND_DOMAIN?.endsWith(domain)
    );
  } */

  function isDomainPresent(domainArray) {
    // console.log("isDomainPresent domarr", domainArray, domainArray.length);
    let isDomPresent = false;
    if (domainArray.length == 1) {
      isDomPresent = domainArray?.some(
        (domain) => !!domain && BRAND_DOMAIN == domain
      );
    } else {
      isDomPresent = domainArray?.some(
        (domain) => !!domain && BRAND_DOMAIN?.endsWith(domain)
      );
    }
    //console.log("isDomPresent", isDomPresent);
    return isDomPresent;
  }

  let superBrandName;
  const {
    ADAC,
    AMP,
    BCG,
    COCACOLA,
    GOOGLE,
    INTEL,
    MASTERCARD,
    MERCEDES,
    SHELL,
    SONIC_SPACE,
    VODAFONE,
    WPP,
  } = brandConstants;
  // always add new brand's if statement at the top of if else block
  // as sonicspace/amp is the default brand which is placed at bottom of if else block
  if (isDomainPresent(sonichub2DevDomains)) {
    superBrandName = AMP;
  } else if (isDomainPresent(sonichub2DemoDomains)) {
    superBrandName = AMP;
  } else if (isDomainPresent(sonichub2WppDomains)) {
    superBrandName = WPP;
  } else if (isDomainPresent(googleDomains)) {
    superBrandName = GOOGLE;
  } else if (isDomainPresent(vodafoneDomains)) {
    superBrandName = VODAFONE;
  } else if (isDomainPresent(cocacolaDomains)) {
    superBrandName = COCACOLA;
  } else if (isDomainPresent(mercedesDomains)) {
    superBrandName = MERCEDES;
  } else if (isDomainPresent(mastercardDomains)) {
    superBrandName = MASTERCARD;
  } else if (isDomainPresent(shellDomains)) {
    superBrandName = SHELL;
  } else if (isDomainPresent(adacDomains)) {
    superBrandName = ADAC;
  } else if (isDomainPresent(wppDomains)) {
    superBrandName = WPP;
  } else if (isDomainPresent(bcgDomains)) {
    superBrandName = BCG;
  } else if (isDomainPresent(intelDomains)) {
    superBrandName = INTEL;
  } else if (isDomainPresent(sonicSpaceDomains)) {
    superBrandName = SONIC_SPACE;
  } else if (isDomainPresent(ampDomains)) {
    superBrandName = AMP;
  } else if (isDomainPresent(devDomains)) {
    superBrandName = SONIC_SPACE;
  } else if (isDomainPresent(sonichub2DemoDomains)) {
    superBrandName = AMP;
  } else {
    superBrandName = SONIC_SPACE;
  }
  if (process.env.NODE_ENV === "development") {
    superBrandName = WPP;
  }
  localStorage.setItem("superBrandName", superBrandName);
  return superBrandName;
};

export default getSuperBrandName;
