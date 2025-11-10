import React from "react";
import {
  WppIconAdd,
  WppIconClose,
  WppIconSearch,
  WppInput,
} from "@wppopen/components-library-react";

const WPPSearchBar = ({ setValue, ...props }) => {
  return (
    <div className={`wpp_search_input_container`} style={{ width: "100%" }}>
      <WppInput
        className={`wpp_search_input`}
        {...props}
        onWppChange={props?.onChange}
      >
        <WppIconSearch slot="icon-start" aria-label="Search icon" />
        <WppIconClose
          slot="icon-end"
          aria-label="Clear icon"
          onClick={() => setValue("")}
        />
      </WppInput>
    </div>
  );
};

export default WPPSearchBar;
