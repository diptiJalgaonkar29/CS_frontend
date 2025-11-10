import React, { useEffect, useRef } from "react";
import "./AddCueIdNoteTextArea.css";
import { ReactComponent as EditIcon } from "../../../../static/common/edit.svg";
import { ReactComponent as CheckRoundedIcon } from "../../../../static/common/checkRounded.svg";
import { ReactComponent as CloseRoundedIcon } from "../../../../static/common/closeRounded.svg";
import { useState } from "react";
import addCueIdNote from "../../services/AIMusicDB/addCueIdNote";
import { useDispatch, useSelector } from "react-redux";
import { SET_TABLE_META } from "../../redux/tableSlice";
import _ from "lodash";

const AddCueIdNoteTextArea = ({
  defaultNote = "",
  id,
  updateTableData,
  tableData,
}) => {
  const [note, setNote] = useState(defaultNote || "");
  const noteRef = useRef();
  const dispatch = useDispatch();
  const { selectedNoteId } = useSelector((state) => state.table);

  const updateNote = (note, id) => {
    const cueNoteMeta = {
      id,
      comment: note?.trim() ?? "",
    };
    addCueIdNote({
      cueNoteMeta,
      onSuccess: () => {
        onBtnClick(id, "CLOSE");
        const newList = tableData?.map((item) => {
          if (+item?.id === +id) {
            return { ...item, comment: note?.trim() };
          }
          return { ...item };
        });
        updateTableData(newList);
      },
    });
  };

  const onBtnClick = (id, action) => {
    if (action === "EDIT") {
      dispatch(SET_TABLE_META({ selectedNoteId: id }));
    } else if (action === "CLOSE") {
      dispatch(SET_TABLE_META({ selectedNoteId: "" }));
    }
  };

  const isNoteSelected = +selectedNoteId === +id && !!id && !!selectedNoteId;

  useEffect(() => {
    if (isNoteSelected) {
      moveCaretToEnd(noteRef.current);
    }
    return () => {
      if (!!selectedNoteId) {
        setNote(defaultNote || "");
      }
    };
  }, [isNoteSelected]);

  function moveCaretToEnd(el) {
    el.focus();
    if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  const READ_MORE_CHAR_LENGTH = 50;

  return (
    <>
      {!isNoteSelected ? (
        <div className="note_container">
          <span className="note">
            {isReadMore
              ? note.slice(0, READ_MORE_CHAR_LENGTH) || ""
              : note || ""}
            {note.length > READ_MORE_CHAR_LENGTH && (
              <span onClick={toggleReadMore} className="readMoreBtn">
                {isReadMore ? "...read more" : " show less"}
              </span>
            )}
          </span>
          <div className="edit_projectName_btn_container">
            <button
              onClick={() => {
                onBtnClick(id, "EDIT");
              }}
              className="edit_btn"
            >
              <EditIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="AddCueIdNoteTextArea_container">
          <textarea
            name="message"
            ref={noteRef}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            value={note}
            className="edit_projectdesc_input"
          />

          <div className="edit_projectName_btn_container">
            <button
              onClick={() => {
                setNote(defaultNote || "");
                onBtnClick(id, "CLOSE");
              }}
              className="close_btn"
            >
              <CloseRoundedIcon />
            </button>
            <button onClick={() => updateNote(note, id)} className="save_btn">
              <CheckRoundedIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCueIdNoteTextArea;
