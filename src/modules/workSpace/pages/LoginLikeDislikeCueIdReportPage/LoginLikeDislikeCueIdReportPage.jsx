import "./LoginLikeDislikeCueIdReportPage.css";
import { useState } from "react";
import { Field, Formik } from "formik";
import InputWrapper from "../../../../branding/componentWrapper/InputWrapper";
import Layout from "../../../../common/components/layout/Layout";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useDispatch } from "react-redux";
import { SET_AUTH_META } from "../../../auth/redux/authSlice";

const LoginLikeDislikeCueIdReportPage = () => {
  const [errorMsg, setErrorMsg] = useState(null);

  const dispatch = useDispatch();

  function onLogin(values, setSubmitting) {
    if (values.password === process.env.REACT_APP_REPORT_PASSWORD) {
      dispatch(SET_AUTH_META({ isReportPasswordValid: true }));
    } else {
      setErrorMsg("Invalid Password");
    }
    setSubmitting(false);
  }

  return (
    <Layout>
      <div className="login_container">
        <div className="login_wrapper">
          <Formik
            initialValues={{ password: "" }}
            validate={(values) => {
              const errors = {};
              if (!values.password) {
                errors.password = "Required";
              }
              return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              onLogin(values, setSubmitting);
            }}
          >
            {({ dirty, isValid, handleChange, handleSubmit, isSubmitting }) => (
              <form className="login_content" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="input_container">
                  <Field
                    label="Password*:"
                    autoFocus
                    placeholder="Password here"
                    type="password"
                    name="password"
                    component={InputWrapper}
                    onChange={(e) => {
                      handleChange(e);
                      setErrorMsg("");
                    }}
                  />
                  {errorMsg && <p className="error_msg">{errorMsg}</p>}
                </div>
                <div className="btn_container">
                  <ButtonWrapper
                    variant="filled"
                    type="submit"
                    disabled={isSubmitting || !isValid || !dirty}
                  >
                    Login
                  </ButtonWrapper>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Layout>
  );
};
export default LoginLikeDislikeCueIdReportPage;
