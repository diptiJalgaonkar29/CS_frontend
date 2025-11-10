import React from "react";
import "./CustomToolTip.css";
import { Fade, Tooltip } from "@mui/material";

const CustomToolTip = ({
  children,
  title,
  followCursor = false,
  placement = "top",
  arrow = false,
}) => {
  return (
    <Tooltip
      title={title ? <span className="custom_tooltip">{title}</span> : null}
      style={{ cursor: title ? "pointer" : "default" }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 200 }}
      followCursor={followCursor}
      placement={placement}
      arrow={arrow}
      // open={true}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -8],
              },
            },
          ],
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default CustomToolTip;
