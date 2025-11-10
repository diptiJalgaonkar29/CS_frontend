import HorizontalBarChart from "./Type/HorizontalBarChart";

const placeHolderTextStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 0,
  height: "calc(100% - 80px)",
  position: "absolute",
  width: "100%",
  fontSize: "16px",
};

const NoDataHorizontalBarChartPlaceholder = ({ placeholder }) => {
  return (
    <div style={{ position: "relative" }}>
      <h4 style={placeHolderTextStyle}>{placeholder}</h4>
      <div style={{ visibility: "hidden" }}>
        <HorizontalBarChart labels={[]} values={[]} />
      </div>
    </div>
  );
};
export default NoDataHorizontalBarChartPlaceholder;
