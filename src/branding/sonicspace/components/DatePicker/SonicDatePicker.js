import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import React from "react";
import "./SonicDatePicker.css";

const SonicDatePicker = ({ className, ...props }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        id="date-picker-dialog"
        inputVariant="outlined"
        className={`sonic_datepicker ${className}`}
        autoComplete="off"
        views={["month", "year"]}
        openTo="year"
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};

export default SonicDatePicker;
