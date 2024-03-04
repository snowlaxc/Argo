import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext"; // 커스텀 인증 컨텍스트를 가져옵니다.
// import CommunicationChatbot from "../components/CommunicationChatbot"
import LearnNav from "../components/LearnNav";
import "./CommunicationPage.css";
import CommunicationHistory from "../components/CommunicationHistory";
import CommunicationStudy from "../components/CommunicationStudy";
import CommunicationSummary from "../components/CommunicationSummary";
import Scorebar from "../components/Scorebar";
import IconStructure from "../icon/IconStructure";

const CommunicationPage = () => {
    const { user } = useContext(AuthContext); // AuthContext에서 user 정보를 가져옵니다.
    const [currentPage, setCurrentPage] = useState(1);
    const BASEURL = `${process.env.REACT_APP_API_URL}/`;

    const [stateN, setStateN] = useState(0); // 0: summary, 1: history, 2: study
    const [stopped, setStopped] = useState(false); //  state == 2 일때 학습중/중단
    const [historyId, setHistoryId] = useState(null);
    const [score, setScore] = useState({});
    const [avgAvg, setAvgAvg] = useState(0);
    const [avgScore, setAvgScore] = useState(0);

    // console.log(stateN, stopped);

    const getAvgScore = async () => {
        const sendingData = { user_no: user.user_no };
        let recieveData = await submit(
            sendingData,
            `${BASEURL}learn/communication/score/`
        );
        recieveData = recieveData ? recieveData : {};
        setScore(recieveData);
        console.log(recieveData);

        setAvgAvg(
            Object.values(recieveData).reduce((sum, { avg }) => sum + avg, 0) /
                Object.keys(recieveData).length
        );
        setAvgScore(
            Object.values(recieveData).reduce(
                (sum, { score }) => sum + score,
                0
            ) / Object.keys(recieveData).length
        );
    };

    useEffect(() => {
        console.log(avgScore, avgAvg);
    }, [avgAvg, avgScore]);

    const handleButtonClick = () => {
        if (stateN === 0) {
            setStateN(2);
        } else if (stateN === 1) {
            setStateN(0);
            setCurrentPage(1);
        } else if (stateN === 2 && stopped === false) {
            setStopped(true);
        } else {
            setStateN(0);
            setCurrentPage(1);
            setStopped(false);
            // getAvgScore();
            window.location.reload();
        }
    };

    const submit = async (dataSend, url) => {
        let data;
        try {
            const response = await fetch(url, {
                // 백엔드 서버에 메시지를 POST 요청
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataSend),
            });

            data = await response.json(); // 백엔드로부터의 응답 받기
        } catch (error) {
            data = null;
            console.error("Error sending message to the chatbot API:", error);
        } finally {
            //
        }
        return data;
    };

    useEffect(() => {
        getAvgScore();
    }, []);

    return (
        <section className="communication_page">
            <LearnNav />
            <div className="communication_page_inner">
                <div className="communication_page_inner2">
                    <div className="communication_page_top">
                        {stateN !== 2 ? (
                            <div className="communication_page_icon">
                                <div className="inner">
                                    <IconStructure
                                        cat={"communication"}
                                        size={`${100}%`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <></>
                        )}
                        {stateN !== 2 ? (
                            <div className="communication_page_scorebar">
                                <Scorebar
                                    cat={"communication"}
                                    avg={avgAvg}
                                    score={avgScore}
                                />
                            </div>
                        ) : (
                            <></>
                        )}
                        <button
                            className="communication_page_button"
                            onClick={handleButtonClick}
                        >
                            {stateN === 0
                                ? "문제풀기"
                                : stateN === 1
                                ? "돌아가기"
                                : stopped === false
                                ? "중단하기"
                                : "돌아가기"}
                        </button>
                    </div>

                    <div className="communication_page_contents">
                        {stateN === 0 ? (
                            <CommunicationSummary
                                stopped={stopped}
                                stateN={stateN}
                                setStateN={setStateN}
                                setStopped={setStopped}
                                historyId={historyId}
                                setHistoryId={setHistoryId}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                score={score}
                            />
                        ) : stateN === 1 ? (
                            <CommunicationHistory
                                stopped={stopped}
                                stateN={stateN}
                                setStateN={setStateN}
                                setStopped={setStopped}
                                historyId={historyId}
                                setHistoryId={setHistoryId}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        ) : (
                            <CommunicationStudy
                                stopped={stopped}
                                stateN={stateN}
                                setStateN={setStateN}
                                setStopped={setStopped}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommunicationPage;
