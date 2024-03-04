import "./LearnDown_1.css"
import WrongAnswers from "./wrongAnswers"
import QuestionList from "./QuestionList"
import React, { useState, useContext } from 'react';

// WrongAnswers : 현재 보여줄 오답 문제(wrongQ) => 가장 최근 오답,
//                원래 정답(answer), 유저 입력(user_answer), 정답률(rate)=>이게 avg인가?
// QuestionList : 틀린 문제 리스트(wrongQList), 페이징에 필요한 내용

const LearnDown1 = (cat, isstudy) => {
  const [historyId, setHistoryId] = useState(null);
  // historyId == result_no

  return (
    <div id="comLearnDown">
      {historyId != null ? <WrongAnswers historyId={historyId}/> : <div id="q_div"><p>문제를 선택해 주세요</p></div>}
      <QuestionList cat={cat} historyId={historyId} setHistoryId={setHistoryId} isstudy={isstudy}/>
    </div>
  )
}

export default LearnDown1;