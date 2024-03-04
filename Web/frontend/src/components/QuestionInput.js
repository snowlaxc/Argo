import "./QuestionInput.css"
import React, { useState, useContext, useCallback } from "react";
 
const QuestionInput = ({chooseAnswer, question, user_content, setUserContent}) => {
 
  return (
    <div id="a">
            <div id="learnInputDiv">
                <input placeholder="이곳에 입력하세요" value={user_content} onChange={(e) => setUserContent(e.target.value)} />
            </div>
            <div id="learnbtnDiv">
                <button key='0' onClick={(e) => chooseAnswer(question.choices[0].answer_no, user_content)}>
                    입력
                </button>
            </div>
        </div>
  )
}
 
export default QuestionInput;