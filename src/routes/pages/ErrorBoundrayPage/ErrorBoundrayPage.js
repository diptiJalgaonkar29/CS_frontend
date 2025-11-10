import React, { Component } from "react";
import Layout from "../../../common/components/layout/Layout";
import "./ErrorBoundrayPage.css";

class ErrorBoundrayPage extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="error_boundary_wrapper">
            <div className="header_container">
              <p className="sub_header highlight_text">
                Something went wrong...
              </p>
            </div>
          </div>
        </Layout>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundrayPage;
