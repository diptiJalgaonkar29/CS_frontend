import React, { useRef } from "react";
import "./CustomSearchBar.css";
import IconWrapper from "../../../../branding/componentWrapper/IconWrapper";

const CustomSearchBar = ({ onChange, value }) => {
  const searchContainer = useRef();

  const changeBorderColor = (color) => {
    searchContainer.current.style.border = `1px solid ${color}`;
  };
  return (
    <div className="custom_search_container" ref={searchContainer}>
      <IconWrapper icon="Search" className="search_icon" />
      <input
        placeholder="Search by name or keyword"
        className="custom_search"
        onChange={onChange}
        value={value}
        onFocus={() => changeBorderColor("var(--color-primary)")}
        onBlur={() => changeBorderColor("var(--color-white)")}
      />
    </div>
  );
};

export default CustomSearchBar;
