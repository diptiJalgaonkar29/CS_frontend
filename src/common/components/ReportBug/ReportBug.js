import React from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { SET_IS_REPORT_MODAL_OPEN } from "../../redux/reportSlice";

export default function ReportBug() {
  const dispatch = useDispatch();

  const handleClickOpen = () => {
    dispatch(SET_IS_REPORT_MODAL_OPEN(true));
  };

  return (
    <div
      aria-haspopup="true"
      onClick={handleClickOpen}
      className={`reportBugContainer`}
      id={`reportBugContainer`}
    >
      <FormattedMessage id="navbar.navItems.reportEnquiry"></FormattedMessage>
    </div>
  );
}
