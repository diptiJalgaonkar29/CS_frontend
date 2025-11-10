import React from "react";
import { ReactComponent as CounterArrow } from "../../../../static/common/counterArrow.svg";
import "./DurationCounter.css";

const DurationCounter = ({ setFieldValue, values, disabled = false }) => {
  const MAX_DURATION = 60;
  const MIN_DURATION = 0;
  const setManualDuration = (event, setFieldValue, values) => {
    setFieldValue("isSameAsVideoLength", "false");
    let Durationvalue = event.target.value
      ?.replace(/^0+/, "")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
    if (+Durationvalue < MIN_DURATION) {
      Durationvalue = "00";
    }
    if (+Durationvalue >= MAX_DURATION) {
      Durationvalue = "59";
    }
    document.getElementById(event.target.name).value =
      Durationvalue?.toString()?.padStart(2, "0") || "00";
    setFieldValue("duration", {
      ...values.duration,
      [event.target.name]: +Durationvalue,
    });
  };

  const updateDuration = (e, setFieldValue, values) => {
    if (+e.keyCode === 38) {
      counter("INCREMENT", e.target.name, setFieldValue, values);
    }
    if (e.keyCode == 40) {
      counter("DECREMENT", e.target.name, setFieldValue, values);
    }
  };

  const counter = (action, id, setFieldValue, values) => {
    setFieldValue("isSameAsVideoLength", "false");
    let prevValue = document.getElementById(id).value;
    let prevStateValue = values.duration[id];
    let Durationvalue = +prevValue
      ?.replace(/^0+/, "")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
    if (action === "INCREMENT") {
      if (id === "minutes" && prevStateValue === MAX_DURATION - 1) {
        return;
      }
      Durationvalue += 1;
    } else {
      if (id === "minutes" && prevStateValue === MIN_DURATION) {
        return;
      }
      Durationvalue -= 1;
    }
    if (+Durationvalue < MIN_DURATION) {
      let minutesElement = document.getElementById("minutes");
      if (document.getElementById(id).id === "seconds") {
        Durationvalue = "59";
        document.getElementById(id).value = Durationvalue || "00";
        if (values.duration.minutes === MIN_DURATION) {
          setFieldValue("duration", {
            ...values.duration,
            seconds: +Durationvalue,
          });
          return;
        }
        let min = (values.duration.minutes - 1).toString().padStart(2, "0");
        minutesElement.value = min || "00";
        setFieldValue("duration", {
          minutes: values.duration.minutes - 1,
          seconds: +Durationvalue,
        });
        return;
      }
    }
    if (+Durationvalue >= MAX_DURATION) {
      if (id === "seconds") {
        Durationvalue = "00";
        document.getElementById(id).value = Durationvalue || "00";
        let min = (values.duration.minutes + 1).toString().padStart(2, "0");
        document.getElementById("minutes").value = min || "00";
        setFieldValue("duration", {
          minutes: values.duration.minutes + 1,
          seconds: +Durationvalue,
        });
        return;
      }
    }
    document.getElementById(id).value =
      Durationvalue.toString().padStart(2, "0") || "00";
    setFieldValue("duration", {
      ...values.duration,
      [id]: +Durationvalue,
    });
  };

  return (
    <div
      className={`main_duration_container ${
        disabled ? "main_duration_container_disabled" : ""
      }`}
    >
      <div className="duration_block">
        <div className="duration_label">Minutes</div>
        <div
          className="set_duration_container cs_image_icon"
          style={{
            borderColor:
              values.duration.minutes || values.duration.seconds
                ? "var(--color-primary)"
                : "var(--color-white)",
          }}
        >
          <input
            type="text"
            name="minutes"
            id="minutes"
            placeholder="00"
            defaultValue="00"
            disabled={disabled}
            onChange={(e) => setManualDuration(e, setFieldValue, values)}
            onKeyDown={(e) => updateDuration(e, setFieldValue, values)}
            autoComplete="off"
          />
          <div className="counter_action_container">
            <div
              className="increment_counter"
              onClick={() => {
                if (disabled) return;
                counter("INCREMENT", "minutes", setFieldValue, values);
              }}
            >
              <CounterArrow />
            </div>
            <div
              className="decrement_counter"
              onClick={() => {
                if (disabled) return;
                counter("DECREMENT", "minutes", setFieldValue, values);
              }}
            >
              <CounterArrow style={{ transform: "rotate(180deg)" }} />
            </div>
          </div>
        </div>
      </div>
      <p className="duration_divider">:</p>
      <div className="duration_block">
        <div className="duration_label">Seconds</div>
        <div
          className="set_duration_container cs_image_icon"
          style={{
            borderColor:
              values.duration.minutes || values.duration.seconds
                ? "var(--color-primary)"
                : "var(--color-white)",
          }}
        >
          <input
            type="text"
            name="seconds"
            placeholder="00"
            defaultValue="00"
            disabled={disabled}
            id="seconds"
            onChange={(e) => setManualDuration(e, setFieldValue, values)}
            onKeyDown={(e) => updateDuration(e, setFieldValue, values)}
            autoComplete="off"
          />
          <div className="counter_action_container">
            <div
              className="increment_counter"
              onClick={() => {
                if (disabled) return;
                counter("INCREMENT", "seconds", setFieldValue, values);
              }}
            >
              <CounterArrow />
            </div>
            <div
              className="decrement_counter"
              onClick={() => {
                if (disabled) return;
                counter("DECREMENT", "seconds", setFieldValue, values);
              }}
            >
              <CounterArrow style={{ transform: "rotate(180deg)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationCounter;
