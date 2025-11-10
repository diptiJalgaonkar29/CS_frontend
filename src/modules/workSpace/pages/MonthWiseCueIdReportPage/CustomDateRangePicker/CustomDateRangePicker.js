import React, { useRef } from "react";
import "./CustomDateRangePicker.css";
import CalenderIcon from "./calender.svg";
import { eachYearOfInterval, getMonth, getYear, subYears } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomDateRangePicker({
  type,
  selectStartDate,
  selectEndDate,
  startDate,
  endDate,
}) {
  const dispatch = useDispatch();
  // const { startDate, endDate } = useSelector((state) => state.dateRange);
  const datepickerStartRef = useRef(null);
  const isStartDate = type === "START_DATE";

  const years = eachYearOfInterval({
    start: subYears(new Date(), 10),
    end: new Date(),
  }).map((date) => getYear(date));
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function handleClickDatepickerStartIcon() {
    const datepickerElement = datepickerStartRef?.current;
    datepickerElement?.setFocus(true);
  }
  return (
    <div className="custom_date_range_container">
      <img
        src={CalenderIcon}
        alt="calender"
        className="calender_icon"
        // onClick={(e) => {
        //   e.stopPropagation();
        // }}
        onClick={() => handleClickDatepickerStartIcon()}
      />
      <DatePicker
        dateFormat="dd.MM.yyyy"
        minDate={isStartDate ? subYears(new Date(), 10) : startDate}
        maxDate={isStartDate ? endDate : new Date()}
        onKeyDown={(e) => {
          e.preventDefault();
        }}
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div
            style={{
              margin: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className="custome-date-button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
            >
              {"<"}
            </button>
            <select
              className="select-option"
              value={getYear(date)}
              onChange={({ target: { value } }) => changeYear(value)}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="select-option"
              value={months[getMonth(date)]}
              onChange={({ target: { value } }) =>
                changeMonth(months.indexOf(value))
              }
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="custome-date-button"
            >
              {">"}
            </button>
          </div>
        )}
        selected={isStartDate ? startDate : endDate}
        onChange={(date) => {
          if (isStartDate) {
            selectStartDate(date);
          } else {
            selectEndDate(date);
          }
        }}
      />
    </div>
  );
}
