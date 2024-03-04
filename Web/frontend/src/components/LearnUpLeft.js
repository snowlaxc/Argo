import "./LearnUpLeft.css"
import IconSense from '../icon/IconSense'
import Scorebar from "../components/Scorebar";
import React, { useState, useContext, useCallback } from "react";

const LearnUpLeft = ({cat, avg, score, isstudy, setStudy}) => {
  const [buttonValue, setButtonValue] = useState("문제 풀기");

  const handleButtonClick = () => {
    setStudy(!isstudy);
    if (isstudy) {
      setButtonValue("문제 풀기")
    } else {
      setButtonValue("학습 종료")
    }
  };

  return (
    <div id="comLearnUpLeft">
        {/* if문으로 아이콘 다르게 불러오기 */}
        {isstudy ? <div></div> : <IconSense />}
        {isstudy ? <div></div> : <div className="communication_page_scorebar"><Scorebar cat={cat} avg={avg} score={score}/></div>}
        <button onClick={handleButtonClick} className="communication_page_button">{buttonValue}</button>
    </div>
  )
}

export default LearnUpLeft;