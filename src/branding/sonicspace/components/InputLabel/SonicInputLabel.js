import "./SonicInputLabel.css";

const SonicInputLabel = ({
  htmlFor = null,
  className = "",
  children,
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`SonicInputLabel ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default SonicInputLabel;
