import React, {
  useContext,
  useState,
  createContext,
  useLayoutEffect,
} from "react";
import getSuperBrandName from "../../utils/getSuperBrandName";

const OsContext = createContext(null);

export const WPPOsProvider = ({ children }) => {
  const [osApiValue, setOsApiValue] = useState(null);
  const [osContextValue, setOsContextValue] = useState(null);
  const [osToken, setOsToken] = useState(null);

  // console.log("CS WPPOsProvider::--brandname", getSuperBrandName());

  useLayoutEffect(() => {
    const csStringThemeData = localStorage.getItem(`csThemeData`);
    if (!!csStringThemeData) {
      try {
        const csJSONThemeData = JSON.parse(csStringThemeData);
        setOsContextValue({ theme: csJSONThemeData });
      } catch (error) {
        console.log("error", error);
      }
    }
  }, []);

  return (
    <OsContext.Provider
      value={{
        osContext: osContextValue,
        osApi: osApiValue,
        osToken: osToken,
      }}
    >
      {children}
    </OsContext.Provider>
  );
};

export const useWPPOs = () => {
  const context = useContext(OsContext);
  return context;
};
