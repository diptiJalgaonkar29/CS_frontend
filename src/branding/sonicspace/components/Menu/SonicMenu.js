import { Menu } from "@mui/material";
import React from "react";
import "./SonicMenu.css";

const ITEM_HEIGHT = 62;

const SonicMenu = ({ open, onClose, onOpening, children, ...props }) => {
  return (
    <Menu
      open={open}
      onClose={onClose}
      onEntering={onOpening}
      {...props}
      // PaperProps={{
      //   style: {
      //     maxHeight: ITEM_HEIGHT * 4.5,
      //     width: 200,
      //   },
      // }}
      className="sonic_menu_container"
    >
      {children}
    </Menu>
  );
};

export default SonicMenu;
