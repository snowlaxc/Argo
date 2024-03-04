import './LearnNav.css';
import { NavLink, useLocation } from "react-router-dom";

const LearningPage = () => {
  const location = useLocation();

  const checkActive = (path) => location.pathname === path ? "active" : "";

  
  return (
    <>
      <div id="learn_nav">
        <div className="learn_button_group">
        <div className={`learn_button ${checkActive("/learn/occupation")}`}>
            <NavLink to="/learn/occupation" className="nav_link">직무이해</NavLink>
          </div>
          <div className={`learn_button ${checkActive("/learn/communication")}`}>
            <NavLink to="/learn/communication" className="nav_link">커뮤니케이션</NavLink>
          </div>
          <div className={`learn_button ${checkActive("/learn/commonsense")}`}>
            <NavLink to="/learn/commonsense" className="nav_link">시사/상식</NavLink>
          </div>
          <div className={`learn_button ${checkActive("/learn/tools")}`}>
            <NavLink to="/learn/tools" className="nav_link">도구</NavLink>
          </div>
          <div className={`learn_button ${checkActive("/learn/ethic")}`}>
            <NavLink to="/learn/ethic" className="nav_link">윤리</NavLink>
          </div> 
        </div>
      </div>
    </>
  )
}

export default LearningPage;
