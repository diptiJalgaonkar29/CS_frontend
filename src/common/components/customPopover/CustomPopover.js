import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import "./CustomPopover.css";

export default function CustomPopover({
  renderBtn,
  popoverContent,
  closePopover = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (closePopover) {
      setAnchorEl(null);
    }
  }, [closePopover]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <div className="renderBtn" onClick={handleClick} aria-describedby={id}>
        {renderBtn}
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className="custom_popover_content_container"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {popoverContent}
      </Popover>
    </div>
  );
}
