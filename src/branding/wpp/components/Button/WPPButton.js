import React from "react";
import { WppButton } from "@wppopen/components-library-react";
import "../../theme/shadow-part.css";

const WPPButton = (props) => {
  const { children, type = "button", variant = "", ...rest } = props;
  return (
    <WppButton variant="primary" type={type} {...rest}>
      {children}
    </WppButton>
  );
};
export default WPPButton;
