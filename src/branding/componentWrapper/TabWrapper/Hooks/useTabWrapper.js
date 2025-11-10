import { useState } from "react";

const useTabWrapper = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    if (newValue !== undefined) {
      setValue(+newValue);
    } else if (event?.detail?.value !== undefined) {
      setValue(+event?.detail?.value);
    }
  };

  return { value, handleChange };
};

export default useTabWrapper;
