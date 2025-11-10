import { useContext } from "react";
import { BrandingContext } from "../branding/provider/BrandingContext";

export const useConfig = () => {
  let config = useContext(BrandingContext);
  return config;
};
