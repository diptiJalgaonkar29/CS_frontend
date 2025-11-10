import { WppFileUpload } from "@wppopen/components-library-react";
import React from "react";

const WPPFileInput = ({
  field: { value, name, ...restFields },
  id,
  form: { setFieldValue, setErrors, errors },
  ...props
}) => {
  const locales = {
    label: props?.placeholder,
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
      props.accept?.split(",")?.map((type) => ({ [type]: extensions[type] })) ||
      null;
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
      name={name}
      multiple={false}
      maxFiles={1}
      size={10000}
      format={"arrayBuffer"}
      onWppChange={(e) => {
        setErrors(name, null);
        // console.log("e.detail?.value?.[0]", e.detail?.value?.[0]);
        setFieldValue(name, e.detail?.value?.[0] || null);
      }}
      // onWppBlur={restFields?.onBlur}
      acceptConfig={getAcceptConfig()}
    ></WppFileUpload>
  );
};
export default WPPFileInput;
