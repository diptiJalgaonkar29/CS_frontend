import React, { useRef } from "react";
import "./SonicSearchBar.css";
import search from "../../../../static/projects_Page/search.svg";
import IconWrapper from "../../../componentWrapper/IconWrapper";

const SonicSearchBar = ({ onChange, value }) => {
  const searchContainer = useRef();

  const changeBorderColor = (color) => {
    searchContainer.current.style.border = `1px solid ${color}`;
  };

  return (
    <div className="sonic_search_container" ref={searchContainer}>
      <IconWrapper icon="Search" className="search_icon" />
      <input
        placeholder="Search by name or keyword"
        className="sonic_search"
        onChange={onChange}
        type="search"
        value={value}
        onFocus={() => changeBorderColor("var(--color-primary)")}
        onBlur={() => changeBorderColor("var(--color-white)")}
      />
    </div>
  );
};

export default SonicSearchBar;
