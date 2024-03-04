import "./wrongAnswers.css";
import React, { useEffect, useState, useContext } from "react";

const WrongAnswers = ({ historyId }) => {
    const [wrong_q, setWrongQ] = useState({
        user_content: "",
        question_content: "문제를 불러오는 중입니다..",
        answer_content: "",
        answer_ration: "",
    });

    // 오답 문제
    useEffect(() => {
        const WrongAnswers = async () => {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/learn/wrongQuestion/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        result_no: historyId,
                    }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                setWrongQ(data.content);
            } else {
            }
        };
        WrongAnswers();
    }, [historyId]); //historyId가 바뀔 때마다 실행되게

    return (
        <div id="q_div">
            <p>오답노트</p>
            <div id="wrongDiv">
                <p>
                    {wrong_q.question_no}. {wrong_q.question_content}
                </p>
                {wrong_q.korean && <p>해석: {wrong_q.korean}</p>}
                <div className="line"></div>
                <div id="wrAnswerDiv">
                    <div>정답: {wrong_q.answer_content}</div>
                    <div>입력: {wrong_q.user_content}</div>
                    <div id="ansPer">정답률: {wrong_q.answer_ratio}%</div>
                </div>
            </div>
        </div>
    );
};

export default WrongAnswers;
