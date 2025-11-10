import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",

      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "var(--color-primary)",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    color: "var(--color-secondary)",
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: "#ECECEC",
    boxSizing: "border-box",
  },
}));

export default function CustomSwitch({ value, setValue }) {
  const [isChecked, setIsChecked] = useState(value);

  useEffect(() => {
    setValue(isChecked);
  }, [isChecked]);

  return (
    <AntSwitch
      inputProps={{ "aria-label": "ant design" }}
      value={isChecked}
      onChange={() => setIsChecked((prev) => !prev)}
    />
  );
}
