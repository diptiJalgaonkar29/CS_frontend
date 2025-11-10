import React from "react";
import { WppSelect, WppListItem } from "@wppopen/components-library-react";
import CountryNames from "../../../../authentication/components/Register/CountryNames";

export const WPPSelect = ({ field, label = "", name, id, value, ...props }) => {
  return (
    <React.Fragment>
      <WppSelect
        labelConfig={{ text: label }}
        {...field}
        {...props}
        // message={errors?.[field?.name] || ""}
        // messageType={errors?.[field?.name] ? "error" : ""}
        onWppChange={props?.onChange || field?.onChange}
      >
        {CountryNames.map((contry) => (
          <WppListItem key={contry.label} value={contry.label}>
            <p slot="label">{contry.label}</p>
          </WppListItem>
        ))}
      </WppSelect>
    </React.Fragment>
  );
};
