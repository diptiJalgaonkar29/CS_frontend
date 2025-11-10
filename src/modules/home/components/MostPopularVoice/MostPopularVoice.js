import React, { useEffect, useState } from "react";
import "./MostPopularVoice.css";
import { useConfig } from "../../../../customHooks/useConfig";
import { useDispatch, useSelector } from "react-redux";
import useTTSSampleVoicePlayPause from "../../../../customHooks/useTTSSampleVoicePlayPause";
import showNotification from "../../../../common/helperFunctions/showNotification";
import { SET_VOICE_META } from "../../../workSpace/redux/voicesSlice";
import CustomLoaderSpinner from "../../../../common/components/customLoaderSpinner/CustomLoaderSpinner";
import VoiceArtistCard from "../../../workSpace/components/VoiceArtistCard/VoiceArtistCard";
import getTTSMostPopularVoicesV2 from "../../../workSpace/services/voiceExternal/getTTSMostPopularVoicesV2";
import axiosCSPrivateInstance from "../../../../axios/axiosCSPrivateInstance";
import getFavVoicesList from "../../../workSpace/services/voiceDB/getFavVoicesList";
import { SET_VOICE_LIST_META } from "../../../workSpace/redux/voicesListSlice";
import getPopularVoicesList from "../../../workSpace/services/voiceDB/getPopularVoicesList";

const MostPopularVoice = ({ onClose }) => {
  const [filteredVoiceData, setFilteredVoiceData] = useState([]);
  const [voiceListLoading, setvoiceListLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState({
    language: "",
    accent: "",
    tag: "",
    industry: "",
    gender: "",
    age: "",
    artistName: "",
    voiceOptionList: "All",
  });

  const [clickedVoiceData, setClickedVoiceData] = useState({});

  let { config } = useConfig();

  const { favVoicesList } = useSelector((state) => state?.voicesList);

  const dispatch = useDispatch();

  const { audioCommonRef, playingAudio, setPlayingAudio, playPause } =
    useTTSSampleVoicePlayPause();

  useEffect(() => {
    getPopularVoicesList()
      .then((res) => {
        const shortNamesArray = res.slice(0, 3);
        const shortNamesString = shortNamesArray.join(",");

        getTTSMostPopularVoicesV2({
          shortName: shortNamesString,
          onSuccess: async (res) => {
            let favdata = await getFavVoicesList();
            dispatch(
              SET_VOICE_LIST_META({
                favVoicesList: favdata,
                popularVoicesList: res,
              })
            );
            setFilteredVoiceData(res.data.voiceData);
            setvoiceListLoading(false);
          },
          onError: (err) => {
            setvoiceListLoading(false);
          },
        });
      })
      .catch(() => setvoiceListLoading(false));
  }, []);

  return (
    <div>
      <div className="voicePage__container">
        <div className="voice_artist_audio_container">
          <audio
            id="voice_artist_audio"
            onError={() => {
              showNotification("ERROR", "Something went wrong!");
              setPlayingAudio((prev) => ({
                ...prev,
                isLoading: false,
              }));
            }}
            controlsList="nodownload noplaybackrate"
            ref={audioCommonRef}
            controls
            onLoadedMetadata={() => {
              setPlayingAudio((prev) => ({
                ...prev,
                isLoading: false,
              }));
            }}
            onEnded={() => {
              setPlayingAudio((prev) => ({
                ...prev,
                isPlaying: false,
              }));
            }}
            onPlay={() => {
              dispatch(
                SET_VOICE_META({
                  isTTSVoicePlaying: true,
                })
              );
            }}
            onPause={() => {
              dispatch(
                SET_VOICE_META({
                  isTTSVoicePlaying: false,
                })
              );
            }}
          />
        </div>
        {filteredVoiceData?.length === 0 && !voiceListLoading ? (
          <div className="spinnerWrapper">
            {/* <CustomLoaderSpinner /> */}
          </div>
        ) : (
          <>
            <p className="most_popular_sub_header">Most popular voices</p>
            {voiceListLoading ? (
              <div className="spinnerWrapper">
                <CustomLoaderSpinner />
              </div>
            ) : 
            filteredVoiceData?.length === 0 ? (
              <div className="messageContent">No Results Found</div>
            ) :
             (
              <>
                <div className="most_popular_artist_list">
                  {filteredVoiceData?.map((voice, i) => {
                    return (
                      <div key={"VoiceCardGrid_" + voice.title + i}>
                        <VoiceArtistCard
                          clickedVoiceData={clickedVoiceData}
                          setClickedVoiceData={setClickedVoiceData}
                          key={voice.title + i}
                          likedArtist={favVoicesList}
                          voice={voice}
                          getTTSVoicesData={() => {}}
                          isShowFavourites={config.modules.showFavourites}
                          filteredItems={filteredItems}
                          onClose={onClose}
                          playingAudio={playingAudio}
                          playPause={playPause}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MostPopularVoice;
