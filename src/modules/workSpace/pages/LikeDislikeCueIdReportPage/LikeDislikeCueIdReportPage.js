import React, { useEffect, useState } from "react";
import "./LikeDislikeCueIdReportPage.css";
import getLikeDislikeCueIdReport from "../../services/likeDislikeCueIdReportDB/getLikeDislikeCueIdReport";
import Table from "../../../../common/components/customTable/Table";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import Layout from "../../../../common/components/layout/Layout";
import BackButton from "../../../../common/components/backButton/BackButton";
import DownloadLikeDislikeCueIdReportExcelBtn from "../../components/DownloadLikeDislikeCueIdReportExcelBtn/DownloadLikeDislikeCueIdReportExcelBtn";
// import Select from "react-select";
// import { Formik } from "formik";
// import getVoiceFilterOptionSelectStyle from "../../helperFunctions/getVoiceFilterOptionSelectStyle";
// import { useConfig } from "../../../../customHooks/useConfig";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import getTrackDetailsByCueID from "../../services/TuneyAIMusic/getTrackDetailsByCueID";
import {
  RESET_CUE_TRACK_META,
  SET_CUE_TRACK_META,
} from "../../redux/tableSlice";
import CueFooterPlayer from "../../components/CueFooterPlayer/CueFooterPlayer";
import { store } from "../../../../reduxToolkit/store";
// import { useNavigate } from "react-router-dom";
import AccessDeniedBlock from "../../components/AccessDeniedBlock/AccessDeniedBlock";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import { useNavigate } from "react-router-dom";
import NavStrings from "../../../../routes/constants/NavStrings";
import axios from "axios";
import axiosSSPrivateInstance from "../../../../axios/axiosSSPrivateInstance";
import { use } from "react";

const columns = [
  // { label: "Id", accessor: "id", sortable: true },
  { label: "Sr. No", accessor: "sr-number", sortable: false },
  { label: "Play", accessor: "play_pause_btn", playPauseBtn: true },
  {
    label: "Tuney Cue Id",
    accessor: "cue_id",
    sortable: true,
    canCopy: true,
  },
  { label: "Note", accessor: "comment", sortable: false, addNote: true },
  {
    label: "Genre",
    accessor: "genre",
    sortable: true,
  },
  {
    label: "Mood",
    accessor: "mood",
    sortable: true,
  },
  {
    label: "Tempo",
    accessor: "tempo",
    sortable: true,
  },
  {
    label: "Full Name",
    accessor: "full_name",
    sortable: true,
  },
  {
    label: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    label: "Project",
    accessor: "project_name",
    sortable: true,
  },
  {
    label: "Updated On",
    accessor: "updated_on_timestamp",
    sortable: true,
  },
  {
    label: "Status",
    accessor: "status",
    sortable: true,
    isStickyAtEnd: true,
  },
];

const LikeDislikeCueIdReportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isValidUser, setIsValidUser] = useState(true);
  const navigate = useNavigate();
  const { authMeta } = getCSUserMeta();
  const { cueTrackMeta: cueTrackMetaState } = useSelector(
    (state) => state.table
  );
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const dispatch = useDispatch();

  const PlayTrack = (cueId) => {
    const {
      table: { cueTrackMeta },
    } = store.getState();
    if (cueTrackMeta?.cueId === cueId) {
      let cueTrackPlayerAudioEle = document.getElementById("cue_track_player");
      const isPaused = cueTrackPlayerAudioEle?.paused;
      if (!!cueTrackPlayerAudioEle) {
        if (isPaused) {
          cueTrackPlayerAudioEle.play();
        } else {
          cueTrackPlayerAudioEle.pause();
        }
      }
      return;
    }
    dispatch(
      SET_CUE_TRACK_META({
        title: cueId,
        cueId: cueId,
        isLoading: true,
      })
    );
    getTrackDetailsByCueID({
      cueID: cueId,
      onSuccess: (res) => {
        dispatch(
          SET_CUE_TRACK_META({
            src: res?.data?.cue_audio_file_url,
          })
        );
      },
      onError: () => {
        dispatch(RESET_CUE_TRACK_META());
      },
    });
  };

  // const loadCueIdReport = () => {
  //   setIsLoading(true);
  //   getLikeDislikeCueIdReport({
  //     onSuccess: (res) => {
  //       if (res.status === 401) {
  //         setIsValidUser(false);
  //         return;
  //       }
  //       setIsLoading(false);
  //       setIsValidUser(true);
  //       try {
  //         let rawData = res.data || [];
  //         setIsValidUser(true);

  //         // 🔍 Get used brand IDs from the raw data
  //         const usedBrandIds = new Set(
  //           rawData.map((item) => String(item?.sub_brand_id))
  //         );

  //         // Filter the brand options to only include those used in rawData
  //         setBrandOptions((prevOptions) =>
  //           prevOptions.filter((brand) => usedBrandIds.has(String(brand.value)))
  //         );

  //         // Filter data based on selected brand (if any)
  //         if (selectedBrandId) {
  //           rawData = rawData.filter(
  //             (item) => String(item?.sub_brand_id) === String(selectedBrandId)
  //           );
  //         }
  //         let formattedData = res.data?.map((item) => ({
  //           ...item,
  //           status: +item?.status === 1 ? "Liked" : "Disliked",
  //           onClickPlayPause: PlayTrack,
  //           updated_on_timestamp: item?.changetimestamp || item?.newtimestamp,
  //         }));
  //         setData(formattedData);
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

  const loadCueIdReport = () => {
    setIsLoading(true);
    getLikeDislikeCueIdReport({
      selectedBrandId,
      onSuccess: (res) => {
        if (res.status === 401) {
          setIsValidUser(false);
          return;
        }

        let rawData = res.data || [];
        setIsValidUser(true);

        // //  Get used brand IDs from the raw data
        // const usedBrandIds = new Set(
        //   rawData.map((item) => String(item?.sub_brand_id))
        // );

        // // Filter the brand options to only include those used in rawData
        // setBrandOptions((prevOptions) =>
        //   prevOptions.filter((brand) => usedBrandIds.has(String(brand.value)))
        // );

        // // Filter data based on selected brand (if any)
        // if (selectedBrandId) {
        //   rawData = rawData.filter(
        //     (item) => String(item?.sub_brand_id) === String(selectedBrandId)
        //   );
        // }

        const formattedData = rawData.map((item) => ({
          ...item,
          status: +item?.status === 1 ? "Liked" : "Disliked",
          onClickPlayPause: PlayTrack,
          updated_on_timestamp: item?.changetimestamp || item?.newtimestamp,
        }));

        setData(formattedData);
        setIsLoading(false);
      },
      onError: (err) => {
        if (err?.response?.status === 401) {
          setIsValidUser(false);
        }
        setIsLoading(false);
      },
    });
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
    loadCueIdReport();
  }, [selectedBrandId]);

  return (
    <Layout hideNavLinks={true}>
      <div className="LikeDislikeCueIdReportPage">
        {isLoading ? (
          <div style={{ textAlign: "center" }}>
            <CustomLoaderSpinner />
          </div>
        ) : (
          <>
            {isValidUser ? (
              <div className="LikeDislikeCueIdReportPage_container">
                <div className="LikeDislikeCueIdReportPage_header">
                  <BackButton />
                  <h2 className="title">Cue Id Like/Dislike Report :</h2>
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
                  {!!data && data?.length > 0 && (
                    <div className="DownloadLikeDislikeCueIdReportExcelBtn_container">
                      <DownloadLikeDislikeCueIdReportExcelBtn data={data} />
                    </div>
                  )}
                </div>
                {!!data && data.length > 0 && (
                  <>
                    <Table
                      dataUpdatedAt={`${cueTrackMetaState?.isPlaying}`}
                      data={data}
                      setData={setData}
                      columns={columns}
                      defaultSortingAccesser={"updated_on_timestamp"}
                      defaultSortingOrder={"desc"}
                    />
                    <CueFooterPlayer />
                  </>
                )}
                {data?.length === 0 && (
                  <div className="no_data_container">
                    <p className="no_data_text">No data found</p>
                  </div>
                )}
              </div>
            ) : (
              <AccessDeniedBlock />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default LikeDislikeCueIdReportPage;
