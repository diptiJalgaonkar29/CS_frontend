import React from "react";
import "./DeleteProjectModal.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";

const DeleteProjectModal = ({
  projectName,
  isOpen,
  onClose = () => { },
  onDelete = () => { },
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="page_delete_menu">
        <p className="page_delete_content">
          Are you sure you want to delete
          <span className="delete_modal_project_name">{projectName}</span>from your projects?
        </p>
        <p className="page_delete_content">
          It will be stored in the Archive for 90 days before being permanently removed.
        </p>
        <div className="page_delete_menu_btns">
          <ButtonWrapper
            // style={{ width: "250px" }}
            onClick={() => onClose()}
          >
            Cancel
          </ButtonWrapper>
          <ButtonWrapper
            variant="filled"
            // style={{ width: "250px" }}
            onClick={() => onDelete()}
          >
            Delete
          </ButtonWrapper>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DeleteProjectModal;
