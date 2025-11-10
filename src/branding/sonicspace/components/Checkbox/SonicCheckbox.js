import "./SonicCheckbox.css";

const SonicCheckbox = (props) => {
  const { field, label, ...rest } = props;
  return (
    <label className="SonicCheckbox_container">
      <input {...field} {...rest} type="checkbox" />
      {label}
    </label>
  );
};
export default SonicCheckbox;
