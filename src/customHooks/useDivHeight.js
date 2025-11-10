import { useState, useEffect, useRef } from "react";

const useDivHeight = () => {
  const ref = useRef(null); // Reference to the element
  const [height, setHeight] = useState(0); // State to store the height

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        const newHeight = ref.current.offsetHeight;
        if (newHeight !== height) {
          setHeight(newHeight); // Update the height if it has changed
        }
      }
    };

    // Initial height check
    updateHeight();

    // Observe changes in size
    const observer = new ResizeObserver(updateHeight);
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup observer
    return () => observer.disconnect();
  }, [height]);

  return [ref, height]; // Return the ref and height
};

export default useDivHeight;
