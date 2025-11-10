import React, { useMemo, useState } from "react";
import "./AudioRetentionTandC.css";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import ModalWrapper from "../../../../branding/componentWrapper/ModalWrapper";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import { brandConstants } from "../../../../utils/brandConstants";
import getBrandName from "../../../../utils/getBrandName";

const superBrandName = getSuperBrandName();
const brandName = getBrandName();

const brandUserOnlyForAudioRetationfile = {
  google: "Google",
  sonicspace: "Amp",
  intel: "Intel",
  bcg: "Bcg",
  wpp: "Wpp",
  adac: "ADAC",
  shell: "Shell",
  mastercard: "Mastercard",
  mercedes: "Mercedes",
  cocacola: "Cocacola",
  vodafone: "Vodafone",
};

const AudioRetentionTandC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const brandRetainFromGetBrand = (meta) => {
    return brandUserOnlyForAudioRetationfile[meta.toLowerCase()] || meta;
  };

  return (
    <div className="AudioRetentionTandC_container">
      <p className="AudioRetentionTandC_text">
        I comply with the video{" "}
        <span onClick={() => setIsOpen(true)}>terms and conditions</span>, and
        have editing right to it
      </p>
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="AudioRetentionTandC_modal"
      >
        <h3 className="AudioRetentionTandC_header boldFamily">
          1. Introduction
        </h3>
        <p className="AudioRetentionTandC_content">
          Welcome to{" "}
          {window.globalConfig?.IS_SHELL_BRAND
            ? "Shell AI Voice Generator"
            : `${brandRetainFromGetBrand(superBrandName) || ""} Sonic Hub`}
          . These terms of service (the &quot;Terms&quot;) govern your use of
          our video uploading and editing services (the &quot;Services&quot;).
          Please read these Terms carefully before using our Services. By
          accessing or using our Services, you agree to be bound by these Terms.
          If you do not agree to these Terms, please do not use our Services.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          2. Eligibility
        </h3>
        <p className="AudioRetentionTandC_content">
          To use our Services, you must be at least 21 years old and have the
          legal capacity to enter into contracts. If you are accessing or using
          our Services on behalf of a company or other legal entity, you
          represent and warrant that you have the authority to bind that entity
          to these Terms.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          3. User Content
        </h3>
        <p className="AudioRetentionTandC_content">
          You may upload videos and other content (collectively, &quot;User
          Content&quot;) to our platform. By uploading User Content, you
          represent and warrant that:
          <ul>
            <li>
              You own or have the necessary permissions to use and upload the
              User Content.
            </li>
            <li>
              The User Content does not infringe upon the intellectual property
              rights, privacy rights, or any other rights of any third party.
            </li>
            <li>
              The User Content complies with all applicable laws and
              regulations.
            </li>
          </ul>
          You retain ownership of your User Content. However, by uploading User
          Content to our platform, you grant your brand a worldwide,
          non-exclusive, royalty-free, sublicensable, and transferable license
          to use, reproduce, distribute, prepare derivative works of, display,
          and perform your User Content in connection with the operation of our
          Services.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          4. Editing Rights
        </h3>
        <p className="AudioRetentionTandC_content">
          Our Services may allow you to edit User Content, including but not
          limited to adding, modifying, or removing elements from the original
          video. When you edit User Content, you agree to:
          <ul>
            <li>
              Comply with all applicable laws and regulations when making edits.
            </li>
            <li>
              Respect the intellectual property rights and privacy of others,
              including the original creators of the User Content you are
              editing.
            </li>
            <li>
              Not use the editing capabilities of our Services for any illegal,
              harmful, or unethical purposes.
            </li>
            <li>
              You own sufficient rights to make changes tot he uploaded video
              asset
            </li>
          </ul>
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          5. Prohibited Content and Conduct
        </h3>
        <p className="AudioRetentionTandC_content">
          You are prohibited from using our Services to upload, edit, or share
          User Content that:
          <ul>
            <li>Violates any applicable laws or regulations.</li>
            <li>Infringes upon the intellectual property rights of others.</li>
            <li>
              Includes personal information of others without their consent.
            </li>
            <li>
              Is sexually explicit or adult in nature without appropriate
              content warnings or restrictions.
            </li>
            <li>Contains viruses, malware, or other malicious code.</li>
            <li>Harasses, threatens, or violates the privacy of others.</li>
          </ul>
          We reserve the right to remove or disable access to any User Content
          that violates these prohibitions or our policies.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          6. Termination
        </h3>
        <p className="AudioRetentionTandC_content">
          We may terminate or suspend your access to our Services at our
          discretion if you violate these Terms. You may also terminate your use
          of our Services at any time by discontinuing your use of our platform.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          7. Disclaimer of Warranties
        </h3>
        <p className="AudioRetentionTandC_content">
          Our Services are provided &quot;as is&quot; and &quot;as
          available.&quot; We do not make any warranties, whether express or
          implied, regarding the availability, accuracy, or reliability of our
          Services.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          8. Limitation of Liability
        </h3>
        <p className="AudioRetentionTandC_content">
          To the fullest extent permitted by law, we shall not be liable for any
          direct, indirect, incidental, special, consequential, or punitive
          damages, or any loss of profits or revenues, whether incurred directly
          or indirectly, or any loss of data, use, goodwill, or other intangible
          losses, resulting from your use or inability to use our Services.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          9. Changes to Terms
        </h3>
        <p className="AudioRetentionTandC_content">
          We may update these Terms from time to time. We will notify you of any
          material changes to these Terms, and your continued use of our
          Services after such changes constitute your acceptance of the updated
          Terms.
        </p>
        <h3 className="AudioRetentionTandC_header boldFamily">
          10. Contact Information
        </h3>
        <p className="AudioRetentionTandC_content">
          If you have any questions about these Terms or our Services, please
          contact us at sonichub@ampcontact.com By using our Services, you agree
          to these Terms and acknowledge that you have read and understood them.
        </p>
        <div className="AudioRetentionTandC_btns">
          <ButtonWrapper
            // style={{ width: "175px" }}
            onClick={() => setIsOpen(false)}
          >
            Back
          </ButtonWrapper>
        </div>
      </ModalWrapper>
    </div>
  );
};
export default AudioRetentionTandC;
