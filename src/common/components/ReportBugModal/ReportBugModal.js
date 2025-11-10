import React, { useState } from "react";
import "./ReportBugModal.css";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import html2canvas from "html2canvas";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import ButtonWrapper from "../../../branding/componentWrapper/ButtonWrapper";
import InputWrapper from "../../../branding/componentWrapper/InputWrapper";
import SonicInputLabel from "../../../branding/sonicspace/components/InputLabel/SonicInputLabel";
import TextAreaWrapper from "../../../branding/componentWrapper/TextAreaWrapper";
import { useDispatch, useSelector } from "react-redux";
import bytesToMegaBytes from "../../../utils/bytesToMegaBytes";
import ModalWrapper from "../../../branding/componentWrapper/ModalWrapper";
import getClientMeta from "../../../utils/getClientMeta";
import CustomLoaderSpinner from "../customLoaderSpinner/CustomLoaderSpinner";
import axios from "axios";
import getSuperBrandId from "../../../utils/getSuperBrandId";
import { SET_IS_REPORT_MODAL_OPEN } from "../../redux/reportSlice";
import axiosSSPrivateInstance from "../../../axios/axiosSSPrivateInstance";
import FileInputWrapper from "../../../branding/componentWrapper/FileInputWrapper";

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const ReportBugModal = () => {
  const [isSubmitted, setSubmitted] = useState(false);
  const [isSubmittingForm, setSubmittingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [screenShot, setscreenShot] = useState(null);
  const dispatch = useDispatch();
  const { isReportModalOpen } = useSelector((state) => state.report);

  const onClose = () => {
    dispatch(SET_IS_REPORT_MODAL_OPEN(false));
  };

  useEffect(() => {
    if (!isReportModalOpen) return;
    html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
    })
      .then(async function (canvas) {
        // console.log("canvas", canvas);
        let dateInMS = Date.now();
        var file = dataURLtoFile(
          canvas.toDataURL("image/png"),
          `screenshot_${dateInMS}.png`
        );
        setscreenShot(file);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [isReportModalOpen]);

  const handleSubmit = async (values) => {
    setSubmittingForm(true);
    const data = {
      ...getClientMeta(),
      subject: values.subject,
      description: values.description,
    };
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (!!values.mediaFile) {
        formData.append("file", values.mediaFile);
      } else {
        formData.append("file", new File([""], "mediaFile"));
      }
      if (!!screenShot) {
        formData.append("SSFile", screenShot);
      } else {
        formData.append("SSFile", new File([""], "SSmediaFile"));
      }

      // await AsyncService.postFormData(`userReport/add`, formData);
      //   let ssDomainPath =
      //   process.env.NODE_ENV === "development"
      //     ? "http://localhost:3002"
      //     : SSDomainPath;

      // const CStoken = await axios.post(
      //   `${ssDomainPath}/api/userReport/add`,
      //   {
      //     headers: {
      //       Authorization: "Basic cmVzdC1jbGllbnQ6cmVzdC1jbGllbnQtc2VjcmV0",
      //       BrandName: getSuperBrandId(),
      //       "Content-Type": "multipart/form-data",
      // BrandId: localStorage.getItem("brandId"),
      //     },
      //   }
      // );

      const reportResponse = await axiosSSPrivateInstance.post(
        `userReport/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("API Response:", response.data);
      setSubmitted(true);
      setSubmittingForm(false);
      setErrorMessage("");
    } catch (error) {
      console.log("error", error);
      setErrorMessage("Something went wrong...");
      setSubmittingForm(false);
    }
  };
  const SUPPORTED_FORMATS = ["image/", "video/"];

  const validationSchema = Yup.object().shape({
    subject: Yup.string().trim().required("Subject is required"),
    description: Yup.string().trim().required("Description is required"),
    mediaFile: Yup.mixed()
      .nullable(true)
      .test("fileFormat", "Unsupported Format", (value) => {
        // console.log("value", value, !value);
        // console.log("value.type", value?.type);
        // console.log("SUPPORTED_FORMATS", SUPPORTED_FORMATS);
        if (!value) return true;
        return SUPPORTED_FORMATS.some((format) =>
          value?.type?.startsWith(format)
        );
      })
      .test("fileSize", "File too large", (value) => {
        let fileSizeInMb = bytesToMegaBytes(value?.size || 0);
        // if (!value) return true;
        return fileSizeInMb < 10;
      }),
  });

  return (
    <ModalWrapper
      isOpen={isReportModalOpen}
      onClose={onClose}
      title={!isSubmitted ? "Report / Enquiry" : ""}
      className="report-bug-dialog"
    >
      <Formik
        initialValues={{
          subject: "",
          description: "",
          mediaFile: null,
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            handleSubmit(values);
          }, 500);
        }}
        validationSchema={validationSchema}
      >
        {(props) => {
          const { dirty, isValid, resetForm, errors, touched, handleSubmit } =
            props;
          return (
            <form onSubmit={handleSubmit}>
              {!isSubmitted ? (
                <>
                  {/* <SonicInputLabel htmlFor="report_subject">
                    Subject*
                  </SonicInputLabel> */}
                  <Field
                    id="report_subject"
                    name="subject"
                    type="text"
                    label="Subject*"
                    // autoFocus
                    placeholder="Write the subject here."
                    component={InputWrapper}
                  />
                  {/* {errors.subject && touched.subject && (
                    <p className="report_form_error">{errors.subject}</p>
                  )} */}
                  <br />
                  <br />
                  {/* <SonicInputLabel htmlFor="report_description">
                    Description*
                  </SonicInputLabel> */}
                  <Field
                    id="report_description"
                    name="description"
                    type="text"
                    label="Description*"
                    placeholder="Write your issue or request."
                    component={TextAreaWrapper}
                    rows="6"
                  />
                  {/* {errors.description && touched.description && (
                    <p className="report_form_error">{errors.description}</p>
                  )} */}
                  <br />
                  <br />
                  <SonicInputLabel
                    htmlFor="report_ref"
                    style={{ marginBottom: "10px" }}
                  >
                    Reference(optional)
                  </SonicInputLabel>
                  <Field
                    id="report_ref"
                    name="mediaFile"
                    label="Reference(optional)"
                    type="file"
                    accept="image/*,video/*"
                    placeholder={`Upload photo or video (max 10mb)`}
                    component={FileInputWrapper}
                    variant="outlined"
                  />
                  {errors.mediaFile && (
                    <p className="report_form_error">{errors.mediaFile}</p>
                  )}

                  {errorMessage && (
                    <p className="report_form_error">{errorMessage}</p>
                  )}
                  <div className="groupButton">
                    {isSubmittingForm ? (
                      <CustomLoaderSpinner />
                    ) : (
                      <div className="report_form_btn_container">
                        <ButtonWrapper onClick={onClose}>Close</ButtonWrapper>
                        <ButtonWrapper
                          type="submit"
                          variant="filled"
                          disabled={isSubmittingForm || !isValid || !dirty}
                        >
                          Submit
                        </ButtonWrapper>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="feedBack_container">
                  <p>Thank you for your message. It is very helpful for us!</p>
                  <ButtonWrapper
                    style={{ width: "auto", padding: "10px 20px" }}
                    variant="filled"
                    onClick={() => {
                      setSubmitted(false);
                      resetForm();
                    }}
                  >
                    Report another issue / Make another enquiry
                  </ButtonWrapper>
                </div>
              )}
            </form>
          );
        }}
      </Formik>
    </ModalWrapper>
  );
};

export default ReportBugModal;
