import React, { useEffect, useState, useRef } from "react";
import "./VoiceTrackReportPage.css";
import getVoiceGeneratedReportMonthly from "../../services/VoiceGenerateReport/VoiceGenerateReport";
import Table from "../../../../common/components/customTable/Table";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import Layout from "../../../../common/components/layout/Layout";
import BackButton from "../../../../common/components/backButton/BackButton";
import DownloadVoiceTrackReportExcelBtn from "../../components/DownloadVoiceTrackReportExcelBtn/DownloadVoiceTrackReportExcelBtn";
import _ from "lodash";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useNavigate } from "react-router-dom";
import AccessDeniedBlock from "../../components/AccessDeniedBlock/AccessDeniedBlock";

import CustomDateRangePicker from "../../components/CustomDateRangePicker/CustomDateRangePicker";
import Grid from "@mui/material/Grid";

import ChartLayout from "../../../../common/components/ChartLayout/ChartLayout";
import Top10Voice from "./Chart/Top10Voice";

import { format, subMonths } from "date-fns";
import { jsPDF } from "jspdf";
import domtoimage from "dom-to-image";
import getSuperBrandName from "../../../../utils/getSuperBrandName";
import capitalizeFirstLetter from "../../../../utils/capitalizeFirstLetter";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import NavStrings from "../../../../routes/constants/NavStrings";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";

const columns = [
  { label: "Sr. No", accessor: "sr-number", sortable: false },
  {
    label: "Artist name",
    accessor: "display_name",
    sortable: true,
  },
  {
    label: "Provider",
    accessor: "voice_provider",
    sortable: true,
  },
  {
    label: "Character count",
    accessor: "voice_text_count",
    sortable: true,
  },
  {
    label: "Duration (second)",
    accessor: "duration",
    sortable: true,
  },
  {
    label: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    label: "Date",
    accessor: "time_stamp",
    sortable: true,
  },
];

const AITrackGeneratedMonthlyReportPage = () => {
  const chart1Ref = useRef(null);
  let superBrandName = getSuperBrandName();
  let capitalBrandname = capitalizeFirstLetter(superBrandName);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isValidUser, setIsValidUser] = useState(true);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());
  const [isReadMore, setIsReadMore] = useState({});
  const { authMeta } = getCSUserMeta();
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [allBrandOptions, setAllBrandOptions] = useState([]);

  const navigate = useNavigate();

  const toggleReadMore = (index) => {
    setIsReadMore((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  // const loadVoiceGenerateReport = () => {
  //   setIsLoading(true);
  //   getVoiceGeneratedReportMonthly({
  //     startDate,
  //     endDate,
  //     onSuccess: (res) => {
  //       console.log("res", res);
  //       if (res.status === 401) {
  //         setIsValidUser(false);
  //         return;
  //       }

  //       setIsLoading(false);
  //       setIsValidUser(true);
  //       try {
  //         setData(res?.data);
  //       } catch (error) {
  //         setData([]);
  //       }
  //     },
  //     onError: (err) => {
  //       if (err?.response?.status === 401) {
  //         setIsValidUser(false);
  //       }
  //       setIsLoading(false);
  //     },
  //   });
  // };

  const loadVoiceGenerateReport = () => {
    setIsLoading(true);
    getVoiceGeneratedReportMonthly({
      startDate,
      endDate,
      selectedBrandId,
      onSuccess: (res) => {
        if (res.status === 401) {
          setIsValidUser(false);
          return;
        }

        setIsLoading(false);
        setIsValidUser(true);

        try {
          const fullData = res?.data || {};
          console.log("fullData", fullData);

          const filteredTTSData = selectedBrandId
            ? fullData.tts_data?.filter(
                (item) => String(item.sub_brand_id) === selectedBrandId
              )
            : fullData.tts_data;

          const filteredMP3Data = selectedBrandId
            ? fullData.tts_mp3_count?.filter(
                (item) => String(item.sub_brand_id) === selectedBrandId
              )
            : fullData.tts_mp3_count;

          setData({
            ...fullData,
            tts_data: filteredTTSData,
            tts_mp3_count: filteredMP3Data,
          });
        } catch (error) {
          setData([]);
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

  function dateFormat(date) {
    var result = new Date(date);
    return format(result, "dd.MM.yyyy");
  }

  // if (!isValidUser && !isLoading) {
  //   return <AccessDeniedPage />;
  // }
  const handleClickOpen = (month, year) => {
    localStorage.setItem("year", year);
    navigate(`/report/cueid-generated/details/${month}`);
  };

  const selectStartDate = (date) => {
    setStartDate(date);
  };

  const selectEndDate = (date) => {
    setEndDate(date);
  };

  const getBrandOptions = async () => {
    try {
      const response = await axiosSSPrivateInstance.get("/brand");
      if (response.status === 200) {
        const brandList = response.data.map((brand) => ({
          value: String(brand.id),
          label: brand.brandName,
        }));
        setAllBrandOptions(brandList); // Store full list
        return brandList;
      }
    } catch (error) {
      console.error("Error fetching brand options:", error);
      return [];
    }
  };

  useEffect(() => {
    const { authMeta } = getCSUserMeta();
    const accessibleRoles = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"];
    if (!accessibleRoles.includes(authMeta?.userRole)) {
      return navigate(NavStrings.HOME);
    }

    getBrandOptions().then((brandList) => {
      setAllBrandOptions(brandList);
    });
  }, []);

  useEffect(() => {
    if (allBrandOptions !== null) {
      loadVoiceGenerateReport();
    }
  }, [startDate, endDate, selectedBrandId, allBrandOptions]);

  const downloadChartAsPDF = () => {
    const pdf = new jsPDF("landscape", "pt", "a4");
    const chart = chart1Ref.current;

    domtoimage
      .toPng(chart)
      .then(function (dataUrl) {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
          const pdfWidth = pdf.internal.pageSize.width;
          const pdfHeight = pdf.internal.pageSize.height;

          const leftMargin = 40;
          const rightMargin = 40;
          const topMargin = 60;
          const bottomMargin = 10;

          const availableWidth = pdfWidth - leftMargin - rightMargin;
          const availableHeight = pdfHeight - topMargin - bottomMargin;

          const imgProps = pdf.getImageProperties(dataUrl);
          const scaledWidth = Math.min(
            availableWidth,
            imgProps.width * (availableHeight / imgProps.height)
          );
          const scaledHeight = (imgProps.height * scaledWidth) / imgProps.width;

          const positionX = leftMargin + (availableWidth - scaledWidth) / 2;

          const positionY = topMargin + 40;

          pdf.setFontSize(16);
          pdf.text("Voice Track Report", pdfWidth / 2, topMargin / 2, {
            align: "center",
          });

          pdf.setFontSize(12);
          pdf.text(
            `Date Range: ${dateFormat(startDate)} - ${dateFormat(endDate)}`,
            pdfWidth / 2,
            topMargin / 2 + 20,
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
            `${capitalBrandname}_VoiceTrackChart_${
              new Date().toISOString().split("T")[0]
            }.pdf`
          );
        };
      })
      .catch(function (error) {
        console.error("Error capturing chart:", error);
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
            <div className="VoiceTrackReportPage_container">
              <div className="VoiceTrackReportPage_header">
                <BackButton />
                <h2 className="title">Voice track generated report :</h2>
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
                      {allBrandOptions?.map((brand) => (
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

                {!!data?.tts_mp3_count && data?.tts_mp3_count?.length > 0 && (
                  <div className="DownloadAITrackReportExcelBtn_container">
                    <ButtonWrapper
                      variant="filled"
                      onClick={downloadChartAsPDF}
                    >
                      Download chart
                    </ButtonWrapper>
                  </div>
                )}
              </div>
              {/* {!!data && data?.length > 0 && ( */}
              {/* {console.log("resTable", data)}{" "} */}
              <div className="chart-container">
                <div ref={chart1Ref}>
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
                        label={"Top 10 Voice"}
                      >
                        <Top10Voice data={data?.tts_mp3_count} />
                      </ChartLayout>
                    </Grid>
                  </Grid>
                </div>
                {!!data?.tts_data && data?.tts_data?.length > 0 && (
                  <div style={{ marginTop: "50px" }}>
                    <div className="DownloadAITrackReportExcelBtn_container">
                      <ButtonWrapper
                        variant="filled"
                        onClick={() =>
                          DownloadVoiceTrackReportExcelBtn(data?.tts_data)
                        }
                      >
                        Download Data
                      </ButtonWrapper>
                    </div>
                    <Table
                      data={data?.tts_data}
                      setData={setData}
                      columns={columns}
                      defaultSortingAccesser={"updated_on_timestamp"}
                      defaultSortingOrder={"desc"}
                      handleClickOpen={handleClickOpen}
                      toggleReadMore={toggleReadMore}
                      isReadMore={isReadMore}
                    />
                  </div>
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
