import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import NavStrings from "../constants/NavStrings";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { authMeta } = useSelector((state) => state.auth);
  const location = useLocation();
  useEffect(() => {
    if (!authMeta?.status) {
      // console.log("location", location);
      if (!location?.pathname?.startsWith(NavStrings.WORKSPACE)) {
        localStorage.setItem("pathname", location?.pathname || "/");
      }
    }
  }, [authMeta?.status]);

  return authMeta?.status ? (
    <>{children}</>
  ) : (
    <Navigate to={NavStrings.UNAUTHORIZED} replace={true} />
  );
};

export default ProtectedRoute;
