import React, { useEffect, useState } from "react";
import "./EditProjectInfoModal.css";
import updateProjectMeta from "../../../workSpace/services/projectDB/updateProjectMeta";
import { SET_PROJECT_META } from "../../../workSpace/redux/projectMetaSlice";
import { useDispatch } from "react-redux";
import showNotification from "../../../../common/helperFunctions/showNotification";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import InputWrapper from "../../../../branding/componentWrapper/InputWrapper";
import TextAreaWrapper from "../../../../branding/componentWrapper/TextAreaWrapper";
import { Formik, Field } from "formik";
import * as Yup from "yup";

const EditProjectInfoModal = ({
  editProjectInfo,
  setEditProjectInfo,
  onClose = () => {},
  onEditSuccess = () => {},
}) => {
  // const [musicLogo, setMusicLogo] = useState(coverImgDefault1);
  const [newProjectInfo, setNewProjectInfo] = useState(editProjectInfo);
  const projectID = newProjectInfo?.projectID;
  const dispatch = useDispatch();

  useEffect(() => {
    setNewProjectInfo(editProjectInfo);
  }, [editProjectInfo]);

  const updateProjectName = (values, setSubmitting) => {
    let projectMeta = {
      projectName: values?.projectName,
      description: values?.projectDescription,
    };
    updateProjectMeta({
      projectID,
      projectMeta,
      onSuccess: () => {
        showNotification("SUCCESS", "Project info updated succesfully!");
        dispatch(
          SET_PROJECT_META({
            projectName: values?.projectName,
            projectDescription: values?.projectDescription,
          })
        );
        setEditProjectInfo({ ...newProjectInfo, isOpen: false });
        onEditSuccess(projectID, projectMeta);
        setSubmitting(false);
      },
      onError: () => {
        setSubmitting(false);
      },
    });
  };

  return (
    <ModalWrapper
      isOpen={newProjectInfo?.isOpen}
      onClose={onClose}
      title="Edit Information"
    >
      <Formik
        initialValues={{
          projectName: editProjectInfo?.projectName || "",
          projectDescription: editProjectInfo?.projectDescription || "",
        }}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            updateProjectName(values, setSubmitting);
          }, 500);
        }}
        validationSchema={Yup.object().shape({
          projectName: Yup.string().required("Required"),
        })}
      >
        {(props) => {
          const { values, dirty, isValid, isSubmitting, handleSubmit } = props;
          return (
            <form onSubmit={handleSubmit} className="edit_wrapper">
              <Field
                label="Project Name *"
                id="projectSettings_projectName"
                placeholder="Enter your project name"
                name="projectName"
                autoFocus
                type="text"
                component={InputWrapper}
                value={values.projectName}
              />
              <Field
                label="Description"
                id="projectSettings_Description"
                name="projectDescription"
                type="text"
                placeholder="Describe your project..."
                component={TextAreaWrapper}
                value={values.projectDescription}
              />
              <div className="edit_project_btn_container">
                <ButtonWrapper
                  variant="outlined"
                  onClick={() =>
                    setNewProjectInfo({ ...newProjectInfo, isOpen: false })
                  }
                >
                  Cancel
                </ButtonWrapper>

                <ButtonWrapper
                  variant="filled"
                  type="submit"
                  disabled={isSubmitting || !isValid || !dirty}
                >
                  Save Changes
                </ButtonWrapper>
              </div>
            </form>
          );
        }}
      </Formik>
    </ModalWrapper>
  );
};

export default EditProjectInfoModal;
