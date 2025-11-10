import React, { useCallback, useEffect, useState } from "react";
import { ReactComponent as Arrow } from "../../../static/common/downArrow.svg";
import { throttle } from "lodash";
import "./ScrollToTopButton.css";

const ScrollToTopButton = () => {
  const MIN_SCROLL_TOP_TO_SHOW_BTN = 100;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, []);

  const throttledScroll = useCallback(
    throttle(() => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled > MIN_SCROLL_TOP_TO_SHOW_BTN) {
        setVisible(true);
      } else if (scrolled <= MIN_SCROLL_TOP_TO_SHOW_BTN) {
        setVisible(false);
      }
    }, 500),
    []
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <Arrow
        id="scroll_to_top_btn"
        className={!visible ? "hide" : ""}
        onClick={scrollToTop}
      />
    </div>
  );
};

export default ScrollToTopButton;
