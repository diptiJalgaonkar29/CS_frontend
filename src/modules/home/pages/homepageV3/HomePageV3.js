import "./HomePageV3.css"
import Layout from '../../../../common/components/layout/Layout'
import ButtonWrapper from '../../../../branding/componentWrapper/ButtonWrapper'
import NavStrings from '../../../../routes/constants/NavStrings'
import HomeProjectListV1 from '../../components/HomeProjectListV1/HomeProjectListV1'
import { useNavigate, useLocation  } from 'react-router-dom'
import React from 'react'
function HomePageV3() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleNewProject = () => {
        navigate(NavStrings.CS_OPTIONS);
    }

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const createParam = params.get("create");
        
        console.log(createParam,'userParam');
        
        if (createParam == 3) {
        console.log("User found in URL → navigating to CS_OPTIONS");
        navigate(NavStrings.CS_OPTIONS);
        } 
       
    }, [location, navigate]);


    return (
        <Layout>
            <div className="hompageV3">
                <div className="header">
                    <div className="header-content">
                        <h1>Create</h1>
                        <p>Turn ideas into original soundtracks and natural speech with AI</p>
                    </div>
                    <ButtonWrapper className="create-button" variant="filled" onClick={handleNewProject} >+ New Project</ButtonWrapper>
                </div>

                <div className="section-title">Your Recent Projects</div>

                <div className="projects-grid">
                    <HomeProjectListV1 />
                </div>
            </div>
        </Layout>
    )
}

export default HomePageV3