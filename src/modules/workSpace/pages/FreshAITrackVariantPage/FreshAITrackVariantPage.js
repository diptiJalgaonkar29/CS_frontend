import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./FreshAITrackVariantPage.css";
import AITrackCard from "../../components/AITrackCard/AITrackCard";
import Layout from "../../../../common/components/layout/Layout";
import { SET_AI_MUSIC_META } from "../../redux/AIMusicSlice";
import { LazyLoadComponent } from "../../../../common/components/lazyLoadComponent/LazyLoadComponent";
import getVariantsTrackNamesAndDescription from "../../helperFunctions/getVariantsTrackNamesAndDescription";
import updateAIMusicMeta from "../../services/AIMusicDB/updateAIMusicMeta";
import CustomLoader from "../../../../common/components/customLoader/CustomLoader";
import generateCue from "../../services/TuneyAIMusic/generateCue";
import generateTrack from "../../services/TuneyAIMusic/generateTrack";
import getCSUserMeta from "../../../../utils/getCSUserMeta";
import ButtonWrapper from "../../../../branding/componentWrapper/ButtonWrapper";
import { useConfig } from "../../../../customHooks/useConfig";
import getLastVariantCount from "../../../../utils/getLastVariantCount";
import addAIMusicResponse from "../../services/AIMusicDB/addAIMusicResponse";
import { AIMusicActions } from "../../constants/AIMusicActions";
import RecentAITrackCard from "../../components/RecentAITrackCard/RecentAITrackCard";
import AITrackCardStability from "../../components/AITrackCard/AITrackCardStability";

const FreshAITrackVariantPage = ({ addLayout = true }) => {
  const dispatch = useDispatch();
  const { uploadedVideoURL } = useSelector((state) => state.video);
  const { stabilityMP3TracksArr, latestFiledataStability } = useSelector((state) => state.AIMusicStability);
  const { stabilityArr } = useSelector((state) => state.AITrackStability);

  const {
    freshAITracksVariantsList,
    selectedAIMusicConfig,
    recentAIGeneratedData,
    SSflaxTrackID,
  } = useSelector((state) => state.AIMusic);
  const { brandMeta } = getCSUserMeta();
  const { projectID } = useSelector((state) => state.projectMeta);
  const [processStatus, setProcessStatus] = useState(false);
  const [newVariants, setNewVariants] = useState(null);
  const VARIATION_COUNT = 5;
  const [variantList, setvariantList] = useState([]);
  const { config, jsonConfig } = useConfig();

  useEffect(() => {
    dispatch(SET_AI_MUSIC_META({ isFreshAITracksListPage: true }));
    return () => {
      dispatch(SET_AI_MUSIC_META({ isFreshAITracksListPage: false }));
    };
  }, []);

  useEffect(() => {
    // console.log("newVariants", newVariants);
    (async () => {
      if (!newVariants) return;
      let newVariantsArr = [...(newVariants || [])];
      let AIMusicMeta;
      if (newVariantsArr?.length !== 0) {
        let AITrackMetaGeneration = newVariantsArr?.map((data) => ({
          mood: data?.settings?.mood,
          genre: data?.settings?.genre,
          tempo: data?.settings?.tempo,
        }));
        let AITrackNameAndDescription =
          await getVariantsTrackNamesAndDescription(
            AITrackMetaGeneration,
            config?.modules?.TRACK_NAME_DESCRIPTION_BY_OPEN_AI,
            getLastVariantCount(recentAIGeneratedData)
          );
        AIMusicMeta = newVariantsArr?.map((data, index) => {
          newVariantsArr[index].label =
            AITrackNameAndDescription?.[index]?.name || `${data?.name}`;
          newVariantsArr[index].desc =
            AITrackNameAndDescription?.[index]?.description || "-";
          return {
            label: AITrackNameAndDescription?.[index]?.name || `${data?.name}`,
            value: data?.cue_id,
            desc: AITrackNameAndDescription?.[index]?.description || "-",
            parentCueId: data?.parent_cue_id,
            action: AIMusicActions.VARIANT,
          };
        });
      }
      let filteredVariantsObj = newVariantsArr.map((variant) => {
        const {
          bpm = "",
          key = "",
          image_url = "",
          peaks = [],
          ...restData
        } = variant;
        return restData;
      });
      dispatch(
        SET_AI_MUSIC_META({
          freshAITracksVariantsList: [
            ...filteredVariantsObj,
            ...(freshAITracksVariantsList ?? []),
          ],
        })
      );

      setProcessStatus(false);
      setNewVariants(null);
      setvariantList([]);

      let AIMusicTrackDetails = filteredVariantsObj?.map((trackMeta) => ({
        mood: trackMeta?.settings?.mood,
        genre: trackMeta?.settings?.genre,
        tempo: trackMeta?.settings?.tempo,
        length: trackMeta?.settings?.length,
        name: trackMeta?.label,
        description: trackMeta?.desc,
        cue_id: trackMeta?.cue_id,
        parent_cue_id: trackMeta?.parent_cue_id,
        sonic_logo_id:
          trackMeta?.custom_stems?.cue_logo?.[0]?.effect_id || null,
        flax_id:
          (trackMeta?.sections?.[0]?.flax_tracks?.[0] === "None"
            ? ""
            : trackMeta?.sections?.[0]?.flax_tracks?.[0] || "") ||
          SSflaxTrackID,
        action: AIMusicActions.VARIANT,
        project_id: projectID,
      }));
      addAIMusicResponse({ responseMeta: AIMusicTrackDetails });
      updateAIMusicMeta({
        projectID,
        AIMusicMeta: {
          variantCueIds: JSON.stringify(AIMusicMeta),
        },
        recentAIGeneratedData,
      });
    })();
  }, [newVariants?.length]);

  useEffect(() => {
    // console.log("variantList", variantList);
    if (
      !!selectedAIMusicConfig?.genre &&
      !!selectedAIMusicConfig?.mood &&
      !!selectedAIMusicConfig?.tempo &&
      !!variantList?.length
    ) {
      // console.log("variantList?.length", variantList?.length);
      // console.log("VARIATION_COUNT", VARIATION_COUNT);
      if (variantList?.length < VARIATION_COUNT) {
        GetTaskID(
          selectedAIMusicConfig?.genre,
          selectedAIMusicConfig?.mood,
          selectedAIMusicConfig?.tempo
        );
      } else {
        setNewVariants(variantList);
      }
    }
  }, [variantList?.length]);

  const GetTaskID = (selectedGenre, selectedMood, selectedTempo) => {
    setProcessStatus(true);

    let body = {
      length: +jsonConfig?.CACHED_AI_MUSIC_LENGTH || 90,
      brand_tag_code: brandMeta?.tuneyBrandName,
      build: "none",
      genre: selectedGenre,
      mood: selectedMood,
      tempo: selectedTempo,
      flex_tracks: ["None"],
    };

    generateTrack({
      config: body,
      onSuccess: (response) => {
        generateCueID(response.data.task_id);
      },
      onError: () => {
        setProcessStatus(false);
      },
    });
  };

  const generateCueID = (taskID) => {
    generateCue({
      taskID,
      // onProgress: (response) => setProcessPercent(response.data.progress * 100),
      onSuccess: (response) => {
        setvariantList((prev) => [response.data, ...prev]);
      },
      onError: () => {
        setProcessStatus(false);
        // setProcessPercent(0);
      },
    });
  };
  const flattenedStabilityArr = stabilityArr.flat().reverse();

  const content = (
    <div className="fresh_AI_variants_container">
      {brandMeta?.aiMusicProvider == "stability" ?

        flattenedStabilityArr.length > 0 && (
          <div style={{ marginTop: 32 }}>
            {stabilityArr?.slice().reverse().map((url, idx) => {
              return (
                <AITrackCard
                  key={idx}
                  type="VARIANT_BLOCK"
                  stabilityArr={[url]} // Pass as single-item array
                  index={idx}
                  oldData={stabilityArr}
                  mp3Url={stabilityMP3TracksArr.flat().reverse()}
                  allDataArr={latestFiledataStability}
                />
              )
            })}
          </div>
        )

        :

        freshAITracksVariantsList != null && (
          <>
            {freshAITracksVariantsList?.length === 0 ? (
              <h1 className="fresh_AI_variants_no_data_header">
                No Variants found
              </h1>
            ) : (
              <>
                <div
                  className={`variant_container ${uploadedVideoURL ? "video" : "no_video"
                    }`}
                  style={{ marginTop: "0px" }}
                >
                  {/* <div className="variant_header_container">
                  <div className="variant_header_container_left">
                    <h1 className="fresh_AI_variants_header">
                      Freshly Made Tracks
                    </h1> */}
                  {/* <div className="variant_sub_header_container">
                      Genre:{" "}
                      {freshAITracksVariantsList?.[0]?.settings?.genre || "-"}
                      <span className="tag_divider">&#8226;</span>
                      Mood:{" "}
                      {freshAITracksVariantsList?.[0]?.settings?.mood || "-"}
                    </div> */}
                  {/* </div>
                  <ButtonWrapper
                    className="frashlyMadeButton"
                    style={{
                      color: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                    }}
                    onClick={() => {
                      GetTaskID(
                        selectedAIMusicConfig?.genre,
                        selectedAIMusicConfig?.mood,
                        selectedAIMusicConfig?.tempo
                      );
                    }}
                  >
                    Load More
                  </ButtonWrapper>
                </div> */}
                  {freshAITracksVariantsList?.map((item, i) => (
                    <LazyLoadComponent
                      className={`fresh_AI_variant_${i}`}
                      ref={React.createRef()}
                      defaultHeight={150}
                      key={`fresh_AI_variant_${i}_${item?.cue_id || item?.value}`}
                    >
                      {!!item?.value ? (
                        <RecentAITrackCard
                          cue={item?.value}
                          label={`${item?.label}`}
                          index={freshAITracksVariantsList?.length - i}
                          description={item?.desc}
                        />
                      ) : (
                        <AITrackCard
                          key={`selected_track_variants_${item?.cue_id}_${i}`}
                          type="RECENT_VARIANT_BLOCK"
                          data={item}
                          index={freshAITracksVariantsList?.length - i}
                          onTrackSelect={() => {
                            dispatch(
                              SET_AI_MUSIC_META({
                                freshAITracksVariantsList: null,
                              })
                            );
                          }}
                        // hideTrackTags={hideTrackTags}
                        />
                      )}
                    </LazyLoadComponent>
                  ))}
                </div>
              </>
            )}
          </>
        )}
    </div>
  );

  return (
    <>
      {processStatus && <CustomLoader />}
      {addLayout ? <Layout>{content}</Layout> : <>{content}</>}
    </>
  );
};

export default FreshAITrackVariantPage;
