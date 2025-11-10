import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { persistor } from "../../../../reduxToolkit/store";

const MusicBankCSPage = () => {
  const { from } = useParams();

  useEffect(() => {
    if (from === "login") {
      persistor?.pause();
      persistor?.flush()?.then(() => {
        return persistor?.purge();
      });
    }
  }, [from]);

  const containerStyle = {
    color: "var(--color-white)",
    fontSize: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return <div style={containerStyle}>Creation Station</div>;
};

export default MusicBankCSPage;
