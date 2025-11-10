import React from "react";
import { WppIconButton } from "@wppopen/components-library-react";
import "../../theme/shadow-part.css";

const WPPIconButton = (props) => {
  const { children, ...rest } = props;
  return (
    <WppIconButton size="m" {...rest}>
      {children}
    </WppIconButton>
  );
};
export default WPPIconButton;
