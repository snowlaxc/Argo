import "./QuestionChoice.css"
import React, { useState, useContext, useCallback } from "react";

const QuestionChoice = ({question, chooseAnswer}) => {
    return (
        <div id="qchoices">
            <ol>
                {Array.isArray(question.choices) && question.choices.map((item) => (
                    <li className="qchoice" key={item.answer_no}>
                        <button value={item.answer_no} onClick={(e) => chooseAnswer(e.target.value, '')}>
                            {item.answer_content}
                        </button>
                    </li>
                ))}
            </ol>
            
        </div>
        )
    }

export default QuestionChoice;