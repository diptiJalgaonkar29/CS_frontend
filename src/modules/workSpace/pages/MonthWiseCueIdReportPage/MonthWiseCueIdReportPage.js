import React, { useEffect, useState, useRef } from "react";
import "./MonthWiseCueIdReportPage.css";
import {
  getAiMusicGeneratedReportMonthly,
  getAITrackingData,
} from "../../services/AiMusicGeneratedReportMonthly/getAiMusicGeneratedReportMonthly";
import Table from "../../../../common/components/customTable/Table";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import Layout from "../../../../common/components/layout/Layout";
import BackButton from "../../../../common/components/backButton/BackButton";
import DownloadMonthWiseCueIdReportExcelBtn from "../../components/DownloadMonthWiseCueIdReport/DownloadMonthWiseCueIdReportExcelBtn";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AccessDeniedBlock from "../../components/AccessDeniedBlock/AccessDeniedBlock";
import CustomDateRangePicker from "../../components/CustomDateRangePicker/CustomDateRangePicker";
import Grid from "@mui/material/Grid";
import ChartLayout from "../../../../common/components/ChartLayout/ChartLayout";
import Top10Tags from "./Chart/Top10Tags";
import Top10Genre from "./Chart/Top10Genre";
import Top10Tempo from "./Chart/Top10Tempo";
import { SET_USER_TRACKING_DATA } from "../../redux/AITrackSlice";
import MonthWiseChart from "./Chart/MonthWiseChart";
import { format, subMonths } from "date-fns";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { jsPDF } from "jspdf";
import domtoimage from "dom-to-image";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import capitalizeFirstLetter from "../../../../utils/capitalizeFirstLetter";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import NavStrings from "../../../../routes/constants/NavStrings";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import { use } from "react";

const columns = [
  { label: "Sr. No", accessor: "sr-number", sortable: false },

  {
    label: "Year",
    accessor: "year",
    sortable: true,
    canCopy: false,
  },
  {
    label: "Month",
    accessor: "month",
    sortable: true,
    canCopy: false,
  },
  {
    label: "Record count",
    accessor: "record_count",
    sortable: true,
    canCopy: false,
  },
  {
    label: "Email",
    accessor: "email",
    sortable: false,
  },

  {
    label: "Action",
    accessor: "detail-page",
    sortable: true,
  },
];
const AITrackGeneratedMonthlyReportPage = () => {
  const chartsContainerRef = useRef(null);
  let superBrandName = getSuperBrandName();
  let capitalBrandname = capitalizeFirstLetter(superBrandName);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isValidUser, setIsValidUser] = useState(true);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  console.log("selectedBrandId", selectedBrandId);
  const { authMeta } = getCSUserMeta();

  console.log("tableData", tableData);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { data } = useSelector((state) => state.AITrackReport);

  function dateFormat(date) {
    var result = new Date(date);
    return format(result, "dd.MM.yyyy");
  }

  // if (!isValidUser && !isLoading) {
  //   return <AccessDeniedPage />;
  // }
  const handleClickOpen = (data) => {
    navigate(
      `/report/cueid-generated/details/${data?.month}?brandId=${selectedBrandId}`,
      { state: data }
    );
  };

  const selectStartDate = (date) => {
    setStartDate(date);
  };

  const selectEndDate = (date) => {
    setEndDate(date);
  };

  const getBrandOptions = () => {
    axiosSSPrivateInstance
      .get("/brand")
      .then((response) => {
        if (response.status === 200) {
          const brandOptions = response.data.map((brand) => ({
            value: brand.id,
            label: brand.brandName,
          }));
          setBrandOptions(brandOptions);
          console.log("brandOptions", brandOptions);
          return brandOptions;
        }
      })
      .catch((error) => {
        console.error("Error fetching brand options:", error);
      });
  };
  useEffect(() => {
    getBrandOptions();
  }, []);

  useEffect(() => {
    const { authMeta } = getCSUserMeta();
    const accessibleRoles = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"];
    if (!accessibleRoles.includes(authMeta?.userRole)) {
      return navigate(NavStrings.HOME);
    }
    fetchStatsData(startDate, endDate, selectedBrandId);
    loadCueIdReport(startDate, endDate, selectedBrandId);
  }, [startDate, endDate, selectedBrandId]);

  const loadCueIdReport = (startDate, endDate, selectedBrandId) => {
    setIsLoading(true);
    getAiMusicGeneratedReportMonthly({
      startDate,
      endDate,
      selectedBrandId,
      onSuccess: (res) => {
        if (res.status === 401) {
          setIsValidUser(false);
          return;
        }
        // console.log("response", res?.data);
        setIsLoading(false);
        setIsValidUser(true);
        try {
          setTableData(res?.data?.report);
        } catch (error) {
          setTableData([]);
        }
      },
      onError: (err) => {
        if (err?.response?.status === 401) {
          setIsValidUser(false);
        }
        setIsLoading(false);
      },
    });
  };

  const fetchStatsData = (startDate, endDate, selectedBrandId) => {
    setIsLoading(true);
    getAITrackingData({
      startDate,
      endDate,
      selectedBrandId,
      onSuccess: (res) => {
        if (res.status === 401) {
          setIsValidUser(false);
          return;
        }
        // console.log("response", res?.data);
        setIsLoading(false);
        setIsValidUser(true);
        try {
          dispatch(
            SET_USER_TRACKING_DATA({
              data: res?.data,
            })
          );
        } catch (error) {
          dispatch(
            SET_USER_TRACKING_DATA({
              data: [],
            })
          );
        }
      },
      onError: (error) => {
        if (error?.response?.status === 401) {
          setIsValidUser(false);
        }
        setIsLoading(false);
        console.log("getting error while fetching data", error);
      },
    });
  };

  const downloadChartsAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const chartsContainer = chartsContainerRef.current;

    domtoimage
      .toPng(chartsContainer)
      .then((dataUrl) => {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const topMargin = 20;
          const sideMargin = 10;
          const headingFontSize = 16;
          const dateRangeFontSize = 12;

          const availableWidth = pdfWidth - 2 * sideMargin;
          const availableHeight = pdfHeight - topMargin;

          const scaledWidth = Math.min(
            availableWidth,
            imgProps.width * (availableHeight / imgProps.height)
          );
          const scaledHeight = (imgProps.height * scaledWidth) / imgProps.width;

          const positionX = (pdfWidth - scaledWidth) / 2;

          const positionY =
            topMargin + headingFontSize + dateRangeFontSize + 10;

          pdf.setFontSize(headingFontSize);
          pdf.text("AI Track Report", pdfWidth / 2, topMargin - 10, {
            align: "center",
          });

          pdf.setFontSize(dateRangeFontSize);
          pdf.text(
            `Date Range: ${dateFormat(startDate)} - ${dateFormat(endDate)}`,
            pdfWidth / 2,
            topMargin / 2 + 20 - 10,
            { align: "center" }
          );

          pdf.addImage(
            dataUrl,
            "PNG",
            positionX,
            positionY,
            scaledWidth,
            scaledHeight
          );
          pdf.save(
            `${capitalBrandname}_AITrackChart_${
              new Date().toISOString().split("T")[0]
            }.pdf`
          );
        };
      })
      .catch((error) => {
        console.error("Error capturing charts:", error);
      });
  };

  return (
    <Layout hideNavLinks={true}>
      {isLoading ? (
        <div style={{ textAlign: "center" }}>
          <CustomLoaderSpinner />
        </div>
      ) : (
        <>
          {isValidUser ? (
            <div className="AICueIdReportPage_container">
              <div className="AIReportPage_header">
                <BackButton />
                <h2 className="title">AI music track generated report :</h2>
                {authMeta?.userRole === "ROLE_SUPER_ADMIN" && (
                  <div className="BrandFilter">
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                    >
                      <option value="" disabled>
                        Filter by brands
                      </option>
                      <option value="">All Brands</option>
                      {brandOptions?.map((brand) => (
                        <option key={brand.value} value={brand.value}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="dates_selection_container">
                <label className="label">Date Range</label>
                <CustomDateRangePicker
                  type="START_DATE"
                  startDate={startDate}
                  endDate={endDate}
                  selectStartDate={selectStartDate}
                />
                <label className="label">To</label>
                <CustomDateRangePicker
                  type="END_DATE"
                  startDate={startDate}
                  endDate={endDate}
                  selectEndDate={selectEndDate}
                />

                {!!data?.data && (
                  <div className="DownloadAITrackReportExcelBtn_container">
                    <ButtonWrapper
                      variant="filled"
                      onClick={downloadChartsAsPDF}
                    >
                      Download Chart
                    </ButtonWrapper>
                  </div>
                )}
              </div>

              <div className="chart-container">
                {!!data?.data && (
                  <div ref={chartsContainerRef}>
                    <Grid
                      container
                      alignItems="center"
                      justify="space-between"
                      spacing={8}
                    >
                      <Grid item xs={12} sm={6} className="Grid-container">
                        <ChartLayout
                          startDate={dateFormat(startDate)}
                          endDate={dateFormat(endDate)}
                          label={"AI music track record count"}
                        >
                          {/* {console.log("data:::::", data)} */}
                          <MonthWiseChart
                            data={data?.data?.cue_ids}
                            startDate={startDate}
                            endDate={endDate}
                          />
                        </ChartLayout>
                      </Grid>
                      <Grid item xs={12} sm={6} className="Grid-container">
                        <ChartLayout
                          startDate={dateFormat(startDate)}
                          endDate={dateFormat(endDate)}
                          label={"Top 10 Moods"}
                        >
                          <Top10Tags data={data?.data?.mood} />
                        </ChartLayout>
                      </Grid>
                      <Grid item xs={12} sm={6} className="Grid-container">
                        <ChartLayout
                          startDate={dateFormat(startDate)}
                          endDate={dateFormat(endDate)}
                          label={"Top 10 Genres"}
                        >
                          <Top10Genre id={"chart3"} data={data?.data?.genre} />
                        </ChartLayout>
                      </Grid>
                      <Grid item xs={12} sm={6} className="Grid-container">
                        <ChartLayout
                          startDate={dateFormat(startDate)}
                          endDate={dateFormat(endDate)}
                          label={"Tempo"}
                        >
                          <Top10Tempo id={"chart4"} data={data?.data?.tempo} />
                        </ChartLayout>
                      </Grid>
                    </Grid>
                  </div>
                )}
                {!!tableData && tableData?.length > 0 && (
                  <>
                    <div style={{ marginTop: "50px" }}>
                      <div className="DownloadAITrackReportExcelBtn_container">
                        <ButtonWrapper
                          variant="filled"
                          onClick={() =>
                            DownloadMonthWiseCueIdReportExcelBtn(tableData)
                          }
                        >
                          Download Data
                        </ButtonWrapper>
                      </div>
                      <Table
                        data={tableData}
                        setData={setTableData}
                        columns={columns}
                        defaultSortingAccesser={"updated_on_timestamp"}
                        defaultSortingOrder={"desc"}
                        handleClickOpen={handleClickOpen}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <AccessDeniedBlock />
          )}
        </>
      )}
    </Layout>
  );
};

export default AITrackGeneratedMonthlyReportPage;
