import { WppFileUpload } from "@wppopen/components-library-react";
import React, { useEffect } from "react";

const WPPVideoInput = ({
  onChange,
  placeholder = "",
  accept = "",
  ...props
}) => {
  const locales = {
    label: placeholder,
    // text: "to upload or drag it here",
    // sizeError: "File exceeds size limit",
    // formatError: "Wrong format",
    // info: function info(accept, size) {
    //   return "Only " + accept + " file at " + size + " MB or less";
    // },
    text: "",
    sizeError: "",
    formatError: "",
    info: function info(accept, size) {
      return "";
    },
  };

  let extensions = {
    "image/*": {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp"],
      "image/gif": [".gif"],
      "image/svg+xml": [".svg"],
      "image/webp": [".webp"],
    },
    "video/*": {
      "video/mp4": [".mp4"],
      "video/mpeg": [".mpeg"],
      "video/quicktime": [".mov"],
    },
  };

  const getAcceptConfig = () => {
    let acceptConfig =
      accept?.split(",")?.map((type) => ({ [type]: extensions[type] })) || null;
    if (acceptConfig && acceptConfig.length > 0) {
      return acceptConfig?.reduce(function (result, item) {
        var key = Object.keys(item)[0];
        return { ...result, ...item[key] };
      }, {});
    } else {
      return null;
    }
  };

  return (
    <WppFileUpload
      id={`wpp_file_input`}
      locales={locales}
      format={"arrayBuffer"}
      onWppChange={(e) => {
        onChange(e.detail?.value?.[0] || null, {
          lastModified: e.detail?.value?.[0]?.lastModified,
          name: e.detail?.value?.[0]?.name,
          size: e.detail?.value?.[0]?.size,
          type: e.detail?.value?.[0]?.type,
        });
      }}
      size={10000}
      // onWppBlur={restFields?.onBlur}
      acceptConfig={getAcceptConfig()}
      {...props}
    ></WppFileUpload>
  );
};
export default WPPVideoInput;
