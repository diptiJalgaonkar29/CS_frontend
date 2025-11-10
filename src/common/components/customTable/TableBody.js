import { Field } from "formik";
import CheckboxWrapper from "../../../branding/componentWrapper/CheckboxWrapper";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import formatDate from "../../../utils/formatDate";
import showNotification from "../../helperFunctions/showNotification";
import IconWrapper from "../../../branding/componentWrapper/IconWrapper";
import { store } from "../../../reduxToolkit/store";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import AddCueIdNoteTextArea from "../../../modules/workSpace/components/AddCueIdNoteTextArea/AddCueIdNoteTextArea";
import getMonthName from "../../../utils/getMonthName";

const RenderTableCell = ({
  accessor,
  preserveSpacesAndLineBreaks,
  canCopy,
  isStickyAtEnd,
  isStickyAtStart,
  data,
  tData,
  index,
  cueTrackMeta,
  updateTableData,
  tableData,
  handleClickOpen,
  isReadMore,
  toggleReadMore,
}) => {
  if (accessor === "sr-number") {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        {index + 1}
      </td>
    );
  } else if (accessor === "month") {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        {getMonthName(data?.month)}
      </td>
    );
  } else if (accessor === "time_stamp") {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        {formatDate(data?.time_stamp)}
      </td>
    );
  } else if (accessor === "voice_text") {
    const READ_MORE_CHAR_LENGTH = 50;
    const expandText = isReadMore[index];
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        {expandText
          ? data?.voice_text || ""
          : data?.voice_text.slice(0, READ_MORE_CHAR_LENGTH) || ""}
        {data?.voice_text?.length > READ_MORE_CHAR_LENGTH && (
          <span onClick={() => toggleReadMore(index)} className="readMoreBtn">
            {expandText ? " show less" : "...read more"}
          </span>
        )}
      </td>
    );
  } else if (accessor === "description") {
    const READ_MORE_CHAR_LENGTH = 50;
    const expandText = isReadMore[index];
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        {expandText
          ? data?.description || ""
          : data?.description.slice(0, READ_MORE_CHAR_LENGTH) || ""}
        {data?.description?.length > READ_MORE_CHAR_LENGTH && (
          <span onClick={() => toggleReadMore(index)} className="readMoreBtn">
            {expandText ? " show less" : "...read more"}
          </span>
        )}
      </td>
    );
  } else if (accessor === "detail-page") {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
        key={`play_pause_btn_${cueTrackMeta?.isPlaying}`}
      >
        <ButtonWrapper
          variant="filled"
          style={{ height: "27px", width: "75px" }}
          onClick={() => {
            handleClickOpen(data);
          }}
        >
          Details
        </ButtonWrapper>
      </td>
    );
  } else if (accessor === "play_pause_btn") {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
        key={`play_pause_btn_${cueTrackMeta?.isPlaying}`}
      >
        {cueTrackMeta?.isLoading && cueTrackMeta?.title === data?.["cue_id"] ? (
          <CustomLoaderSpinner />
        ) : (
          <IconWrapper
            onClick={() => data?.[`onClickPlayPause`](data?.["cue_id"])}
            className="cue_track_play_pause_icon"
            icon={
              cueTrackMeta?.isPlaying &&
              cueTrackMeta?.title === data?.["cue_id"]
                ? "BorderedPause"
                : "BorderedPlay"
            }
          />
        )}
      </td>
    );
  } else if (accessor?.startsWith("comment")) {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        <AddCueIdNoteTextArea
          updateTableData={updateTableData}
          tableData={tableData}
          defaultNote={data?.comment || ""}
          id={data?.id}
        />
      </td>
    );
  } else if (accessor?.startsWith("actionBtn")) {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        <ButtonWrapper
          variant="filled"
          onClick={() =>
            data?.[`onClick${accessor?.split("actionBtn")?.[1]}`](data?.["id"])
          }
        >
          {tData}
        </ButtonWrapper>
      </td>
    );
  } else if (accessor?.startsWith("checkboxBtn")) {
    return (
      <td
        className={`${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        <Field
          type="checkbox"
          name="selectedCombination"
          value={data?.[accessor]}
          component={CheckboxWrapper}
          label={
            data?.[`checkboxBtnLabel${accessor?.split("checkboxBtn")?.[1]}`] ||
            ""
          }
        />
      </td>
    );
  } else if (accessor?.toLowerCase()?.endsWith("status")) {
    return (
      <td
        className={`${data?.[accessor]} status ${
          isStickyAtEnd ? "stickyAtEnd" : ""
        } ${isStickyAtStart ? "stickyAtStart" : ""} ${
          !!data?.detailedStatus ? data?.detailedStatus : ""
        }`}
      >
        {tData}
      </td>
    );
  } else {
    return (
      <td
        className={`${accessor} ${isStickyAtEnd ? "stickyAtEnd" : ""} ${
          isStickyAtStart ? "stickyAtStart" : ""
        }`}
      >
        <span
          style={{
            whiteSpace: preserveSpacesAndLineBreaks ? "pre" : "none",
          }}
        >
          {tData}
        </span>
        {canCopy && data?.[accessor] && (
          <IconWrapper
            icon="Copy"
            className="copy_icon"
            onClick={() =>
              navigator.clipboard
                .writeText(tData)
                .then(() => showNotification("SUCCESS", "Copied to clipboard"))
            }
          />
        )}
      </td>
    );
  }
};

const TableBody = ({
  tableData,
  columns,
  updateTableData,
  handleClickOpen,
  isReadMore,
  toggleReadMore,
}) => {
  const {
    table: { cueTrackMeta },
  } = store.getState();
  return (
    <tbody>
      {tableData?.map((data, index) => {
        return (
          <tr key={`${data?.id}_${data?.status}_${index}`}>
            {columns?.map(
              (
                {
                  accessor,
                  preserveSpacesAndLineBreaks,
                  canCopy,
                  isStickyAtEnd,
                  isStickyAtStart,
                },
                i
              ) => {
                const tData = data?.[accessor]
                  ? accessor.endsWith("timestamp")
                    ? formatDate(data?.[accessor])
                    : data?.[accessor]
                  : "——";
                return (
                  <RenderTableCell
                    key={`${tData || ""}_${index}_${i}`}
                    data={data}
                    tData={tData}
                    accessor={accessor}
                    preserveSpacesAndLineBreaks={preserveSpacesAndLineBreaks}
                    canCopy={canCopy}
                    isStickyAtEnd={isStickyAtEnd}
                    isStickyAtStart={isStickyAtStart}
                    index={index}
                    cueTrackMeta={cueTrackMeta}
                    tableData={tableData}
                    updateTableData={updateTableData}
                    handleClickOpen={handleClickOpen}
                    toggleReadMore={toggleReadMore}
                    isReadMore={isReadMore}
                    // length={tableData?.length}
                    // defaultSortingOrder={defaultSortingOrder}
                  />
                );
              }
            )}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableBody;
