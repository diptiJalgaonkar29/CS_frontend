import React, { Suspense } from "react";
import { brandConstants } from "../../utils/brandConstants";
import getSuperBrandName from "../../common/utils/getSuperBrandName";

const WPPDatePicker = React.lazy(() =>
  import("../wpp/components/DatePicker/WPPDatePicker")
);
const SonicDatePicker = React.lazy(() =>
  import("../sonicspace/components/DatePicker/SonicDatePicker")
);
//import SonicDatePicker from "../sonicspace/components/DatePicker/SonicDatePicker";

const superBrandName = getSuperBrandName();

const RenderDatePicker = (props) => {
  switch (superBrandName) {
    case brandConstants.WPP:
      return <WPPDatePicker {...props} />;
    default:
  return <SonicDatePicker {...props} />;
  }
};

const DatePickerWrapper = (props) => {
  return (
    <Suspense fallback={<></>}>
    <RenderDatePicker {...props} />
    </Suspense>
  );
};

export default DatePickerWrapper;
