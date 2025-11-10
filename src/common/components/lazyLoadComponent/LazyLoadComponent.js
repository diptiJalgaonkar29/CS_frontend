import React, { useEffect, useState } from "react";
import "./LazyLoadComponent.css";

export const LazyLoadComponent = React.forwardRef((props, ref) => {
  const [childRef, setChildRef] = useState(null);
  const [childHeight, setChildHeight] = useState(null);
  const [isVisible, setVisibilty] = useState(false);

  useEffect(() => {
    let observer;
    if (ref.current && childRef === null) {
      setChildRef(ref);
    }
    if (childRef !== null) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting === true) {
            handleIntersectionElement(entry);
          }
        });
      });

      observer.observe(ref.current);
    }
  }, [childRef, ref]);

  const handleIntersectionElement = (entry) => {
    setVisibilty(true);
    if ([entry.target.children][0].offsetHeight !== undefined) {
      const heightFromFirstChild =
        entry.target && [...entry.target.children][0].offsetHeight;
      setChildHeight(heightFromFirstChild);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        height: "auto",
        minHeight: `${childHeight ? childHeight : props.defaultHeight}px`,
      }}
      className={props.className || ""}
    >
      {isVisible ? props.children : null}{" "}
    </div>
  );
});
