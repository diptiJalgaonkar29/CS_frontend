import React from "react";
import "./SonicMenuItem.css";
import { MenuItem } from "@mui/material";

const SonicMenuItem = ({ children, ...props }) => {
  return <MenuItem {...props}>{children}</MenuItem>;
};

export default SonicMenuItem;
