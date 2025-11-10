import React, { Suspense } from "react";
import { FormattedMessage } from "react-intl";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";

const WPPTypographyText = React.lazy(() =>
  import("../wpp/components/TypographyBox/WPPTypographyText")
);

const superBrandName = getSuperBrandName();

const RenderTypography = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP: {
      let fontType = getWPPFontType(props.type);
      let fontSlot = getWPPFontSlot(props.slot);
      return (
        <WPPTypographyText type={fontType} slot={fontSlot} {...props}>
          {props.textID ? <FormattedMessage id={props.textID} /> : props.text}
        </WPPTypographyText>
      );
    }
    default:
  return getSonicTextBlock(props);
  }
};

const getSonicTextBlock = (props) => {
  switch (props.slot) {
    case "h1":
      return (
        <h1>
          <FormattedMessage id={props.textID} className={props.className} />
        </h1>
      );
    case "h2":
      return (
        <h2>
          <FormattedMessage id={props.textID} className={props.className} />
        </h2>
      );
    case "h3":
      return (
        <h3>
          <FormattedMessage id={props.textID} className={props.className} />
        </h3>
      );
    case "h4":
      return (
        <h4>
          <FormattedMessage id={props.textID} className={props.className} />
        </h4>
      );
    case "h5":
      return (
        <h5>
          <FormattedMessage id={props.textID} className={props.className} />
        </h5>
      );
    case "h6":
      return (
        <h6>
          <FormattedMessage id={props.textID} className={props.className} />
        </h6>
      );
    case "p":
      return (
        <p>
          <FormattedMessage id={props.textID} className={props.className} />
        </p>
      );
    default:
      return (
        <span>
          <FormattedMessage id={props.textID} className={props.className} />
        </span>
      );
  }
};

const getWPPFontType = (type) => {
  switch (type) {
    case "2xl-heading":
      return "2xl-heading";
    case "2xs-strong":
      return "2xs-strong";
    case "3xl-heading":
      return "3xl-heading";
    case "4xl-display":
      return "4xl-display";
    case "5xl-display":
      return "5xl-display";
    case "l-body":
      return "l-body";
    case "l-midi":
      return "l-midi";
    case "l-strong":
      return "l-strong";
    case "m-body":
      return "m-body";
    case "m-midi":
      return "m-midi";
    case "m-strong":
      return "m-strong";
    case "s-midi":
      return "s-midi";
    case "s-strong":
      return "s-strong";
    case "xl-heading":
      return "xl-heading";
    case "xs-body":
      return "xs-body";
    case "xs-midi":
      return "xs-midi";
    case "xs-strong":
      return "xs-strong";
    default:
      return "m-body";
  }
};

const getWPPFontSlot = (tag) => {
  switch (tag) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    case "p":
      return "p";
    case "span":
      return "span";
    default:
      return "span";
  }
};

const TypographyWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
      <RenderTypography {...props} />
    </Suspense>
  );
};

export default TypographyWrapper;
