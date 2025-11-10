import { useEffect, useRef } from "react";

const useDidMount = () => {
  const didMount = useRef(false);
  useEffect(() => {
    didMount.current = true;
    return () => {
      didMount.current = false;
    };
  }, []);
  return didMount?.current;
};

export default useDidMount;
