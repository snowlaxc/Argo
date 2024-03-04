import "./solveQuestion.css";
import LearnDown_2 from "../components/LearnDown_2";
import React, { useState, useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";

// LearnDown_2 : 풀 문제(question)

const SolveQuestion = ({ cat, question }) => {
    const { user } = useContext(AuthContext);
    const user_no = user.user_no;
    const [answer_no, setAnswerNo] = useState(""); //유저가 고른 답
    const [now_question, setNowQuestion] = useState(question); //현재 문제
    const question_no = now_question.question_no; //현재 문제 번호
    const [user_content, setUserContent] = useState("");

    const chooseAnswer = async (choose, user_content) => {
        try {
            // setAnswerNo(choose);

            //Result 저장
            await fetch(`${process.env.REACT_APP_API_URL}/learn/insertResult/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_no,
                    answer_no: choose,
                    question_no,
                    user_content,
                }),
            });

            //문제 불러오기
            const response2 = await fetch(
                `${process.env.REACT_APP_API_URL}/learn/getQuestion/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cat,
                    }),
                }
            );
            const data2 = await response2.json();

            if (response2.ok) {
                setNowQuestion(data2.wrong_question);
            } else {
            }
        } catch (error) {}

        setUserContent("");
    };
    //시사상식일 때
    const chooseCommonsenseAnswer = async (choose, user_content) => {
        try {
            // setAnswerNo(choose);
   
            //Result 저장
            await fetch(`${process.env.REACT_APP_API_URL}/learn/insertResult/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_no,
                    answer_no: choose,
                    question_no,
                    user_content,
                }),
            });
            // 사용자 카테고리별 문제 체크
            const checkResponse = await fetch(
                `${process.env.REACT_APP_API_URL}/learn/check_result`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_no }),
                }
            );
            const checkData = await checkResponse.json();

            let response2;
            if (checkResponse.ok && checkData.completed_all_categories) {
                // 모든 카테고리를 완료했으면 추천 문제 불러오기
                response2 = await fetch(
                    `${process.env.REACT_APP_API_URL}/filter_test/recommend_problems_view/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ cat, user_no }),
                    }
                );
            } else {
                // 완료하지 않았으면 일반 문제 불러오기
                response2 = await fetch(
                    `${process.env.REACT_APP_API_URL}/learn/getQuestion/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ cat }),
                    }
                );
            }    
            const data2 = await response2.json();
   
            if (response2.ok) {
                setNowQuestion(data2.wrong_question);
            } else {
            }
        } catch (error) {}
   
        setUserContent("");
    };
    return (
        <div id="solve_question">
            <div id="learn_down">
                {cat==='commonsense' ?
                  <LearnDown_2
                    chooseAnswer={chooseCommonsenseAnswer}
                    question={now_question}
                    user_content={user_content}
                    setUserContent={setUserContent}/>
                : <LearnDown_2
                    chooseAnswer={chooseAnswer}
                    question={now_question}
                    user_content={user_content}
                    setUserContent={setUserContent}
                />}
               
            </div>
        </div>
    );
};

export default SolveQuestion;
