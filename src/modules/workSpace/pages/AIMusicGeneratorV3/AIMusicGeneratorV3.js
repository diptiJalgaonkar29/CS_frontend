import { useSelector } from 'react-redux';
import MusicGenerationForm from '../../components/AIMusicGenerationForm/MusicGenerationForm'
import { SideBarMusicStyleSelector } from '../../components/SideBarMusicStyleSelector/SideBarMusicStyleSelector'
import '../AIMusicGeneratorV3/AIMusicGeneratorV3.css'
import { useState } from 'react';
import Layout from '../../../../common/components/layout/Layout';

export default function AIMusicGeneratorV3() {
    const { aiMusicGeneratorProgress, aiMusicGeneratorAnalysisDetails } = useSelector((state) => state.AIMusic);
    const [selectedAIGenTab, setSelectedAIGenTab] = useState("SIMPLE");

    return (
        <Layout>

            <div className="ai_generator_v3">
                <div className="card ai_generator_option">
                    <div className="tab_header" >
                        <span
                            className={`tab ${selectedAIGenTab === "SIMPLE" ? "activeTab" : ""}`}
                            onClick={() => setSelectedAIGenTab("SIMPLE")}
                        >
                            Simple
                        </span>

                        <span
                            className={`tab ${selectedAIGenTab === "ADVANCED" ? "activeTab" : ""
                                }`}
                            onClick={() => setSelectedAIGenTab("ADVANCED")}
                        >
                            Advanced
                        </span>
                    </div>
                    {selectedAIGenTab === "SIMPLE" ? (
                        <>
                            <MusicGenerationForm />
                        </>
                    ) : (
                        <>
                            <h2 className="title">Compose with AI</h2>
                            <p className="subTitle">
                                Select the genre, mood, and tempo you want to craft the ideal music
                                for your project.
                            </p>
                            <SideBarMusicStyleSelector />
                        </>
                    )}
                </div>
                <div className="right_ai_generator_v3">
                    <h2>AI Music Generator</h2>
                    <span>Unleash the perfect soundtrack for your projects in seconds! Whether you’re creating content for social media, vlogs, or professional projects, you’ll always have the perfect tune to match the vibe.</span>
                    <span>Start the journey with a video, a brief, or writing your ideas for the track you have in mind.</span>
                </div>
            </div>
        </Layout>
    )
}
