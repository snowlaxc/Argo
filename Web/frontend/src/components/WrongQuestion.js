import "./WrongQuestion.css"
import LearnDown_1 from "../components/LearnDown_1"
import LearnUpLeft from "./LearnUpLeft";
import React, { useState, useContext, useCallback } from "react";

// LearnUpLeft : cat, avg, score
// LearnDown_1 : 현재 보여줄 오답 문제(wrongQ) => 가장 최근 오답,
//               원래 정답(answer), 유저 입력(user_answer), 정답률(rate)=>이게 avg인가?, 
//               틀린 문제 리스트(wrongQList)

const WrongQuestion = ({cat, avg, score, isStudy, setStudy}) => {

  return (
    <div id="solve_question">
        <div id="learn_up">
          <div id="learn_up_left">
              <LearnUpLeft cat={cat} avg={avg} score={score} isStudy={isStudy} setStudy={setStudy}/>
          </div>
        </div>
        <div id="learn_down">
            <LearnDown_1 cat={cat}/>
        </div>
    </div>
  )
}

export default WrongQuestion;