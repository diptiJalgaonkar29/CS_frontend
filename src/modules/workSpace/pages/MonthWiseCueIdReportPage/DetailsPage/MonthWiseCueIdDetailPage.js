import React, { useEffect, useState } from "react";
import "./MonthWiseCueIdDetailPage.css";
import getMonthWiseDetailsGeneratedReportMonthly from "../../../services/AiMusicGeneratedReportMonthly/getMonthWiseTrackDetailsReport";
import Table from "../../../../../common/components/customTable/Table";
import CustomLoaderSpinner from "../../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import Layout from "../../../../../common/components/layout/Layout";
import BackButton from "../../../../../common/components/backButton/BackButton";
import DownloadMonthWiseDetailsReportExcelBtn from "../../../components/DownloadMonthWiseCueIdReport/DownloadMonthWiseDetailsReportExcelBtn";
import _ from "lodash";
import { useParams, useLocation } from "react-router-dom";
import AccessDeniedBlock from "../../../components/AccessDeniedBlock/AccessDeniedBlock";
import getMonthName from "../../../../../utils/getMonthName";
import CueFooterPlayer from "../../../components/CueFooterPlayer/CueFooterPlayer";
import { store } from "../../../../../reduxToolkit/store";
import { useDispatch, useSelector } from "react-redux";
import getTrackDetailsByCueID from "../../../services/TuneyAIMusic/getTrackDetailsByCueID";
import {
  RESET_CUE_TRACK_META,
  SET_CUE_TRACK_META,
} from "../../../redux/tableSlice";
import ButtonWrapper from "../../../../../branding/componentWrapper/ButtonWrapper";

const columns = [
  // { label: "Id", accessor: "id", sortable: true },
  { label: "Sr. No", accessor: "sr-number", sortable: false },
  { label: "Play", accessor: "play_pause_btn", playPauseBtn: true },
  {
    label: "Cue Id",
    accessor: "cue_id",
    sortable: true,
  },
  {
    label: "Track name",
    accessor: "name",
    sortable: true,
  },
  {
    label: "Description",
    accessor: "description",
    sortable: true,
  },
  {
    label: "Mood",
    accessor: "mood",
    sortable: true,
  },
  {
    label: "Genre",
    accessor: "genre",
    sortable: true,
  },
  {
    label: "Tempo",
    accessor: "tempo",
    sortable: true,
  },

  // {
  //   label: "Email",
  //   accessor: "email",
  //   sortable: true,
  // },

  {
    label: "Date",
    accessor: "newtimestamp",
    sortable: true,
  },
];

const AITrackGeneratedMonthlyReportPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isValidUser, setIsValidUser] = useState(true);
  const location = useLocation();
  let { month } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const brandId = queryParams.get("brandId");
  // console.log("brandId", brandId);
  let monthName = getMonthName(month);
  const receivedData = location.state;

  const { cueTrackMeta: cueTrackMetaState } = useSelector(
    (state) => state.table
  );
  const [isReadMore, setIsReadMore] = useState({});
  const dispatch = useDispatch();

  const toggleReadMore = (index) => {
    setIsReadMore((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
  const loadAITrackMonthReport = (brandId) => {
    setIsLoading(true);
    getMonthWiseDetailsGeneratedReportMonthly({
      month: month,
      email: receivedData?.email,
      brandId: brandId,
      onSuccess: (res) => {
        if (res?.status === 401) {
          setIsValidUser(false);
          return;
        }
        // console.log("response", res?.data);
        setIsLoading(false);
        setIsValidUser(true);
        try {
          let formattedData = res?.data?.report?.map((item) => ({
            ...item,
            onClickPlayPause: PlayTrack,
            updated_on_timestamp: item?.changetimestamp || item?.newtimestamp,
          }));
          setData(formattedData);
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

  useEffect(() => {
    // setDetailsDatas(dataReport);
    loadAITrackMonthReport(brandId);
  }, [brandId]);

  return (
    <Layout>
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
                <h2 className="title">{`AI track details report : ${
                  monthName || ""
                } ${receivedData?.year || ""}`}</h2>
                {!!data && data?.length > 0 && (
                  <div className="DownloadLikeDislikeCueIdReportExcelBtn_container">
                    <ButtonWrapper
                      variant="filled"
                      onClick={() =>
                        DownloadMonthWiseDetailsReportExcelBtn(data)
                      }
                    >
                      Download
                    </ButtonWrapper>
                    {/* <DownloadMonthWiseDetailsReportExcelBtn data={data} /> */}
                  </div>
                )}
              </div>
              {!!data && data?.length > 0 && (
                <>
                  <Table
                    dataUpdatedAt={`${cueTrackMetaState?.isPlaying}`}
                    data={data}
                    setData={setData}
                    columns={columns}
                    defaultSortingAccesser={"updated_on_timestamp"}
                    defaultSortingOrder={"desc"}
                    toggleReadMore={toggleReadMore}
                    isReadMore={isReadMore}
                  />
                  <CueFooterPlayer />
                </>
              )}
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
