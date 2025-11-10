import { Tabs } from "@material-ui/core";
import React from "react";
import "./SonicTabHeaders.css";

const SonicTabHeaders = ({ value, onChange, children }) => {
  return (
    <Tabs value={value} onChange={onChange} className="sonic_tab_headers">
      {children}
    </Tabs>
  );
};

export default SonicTabHeaders;
