import { useEffect, useState, useContext } from "react";
import "./CommunicationHistory.css";
import CommunicationHistoryList from "./CommunicationHistoryList";
import AuthContext from "../context/AuthContext";

const CommunicationHistory = ({
    stopped,
    stateN,
    setStateN,
    setStopped,
    historyId,
    setHistoryId,
    currentPage,
    setCurrentPage,
}) => {
    const { user } = useContext(AuthContext);
    const labelSums = {
        Clear: 0,
        Concise: 0,
        Concrete: 0,
        Correct: 0,
        Coherent: 0,
        Complete: 0,
        Courteous: 0,
    };
    const labelCounts = {
        Clear: 0,
        Concise: 0,
        Concrete: 0,
        Correct: 0,
        Coherent: 0,
        Complete: 0,
        Courteous: 0,
    };
    const [historyDetail, setHistoryDetail] = useState({});
    const BASEURL = `${process.env.REACT_APP_API_URL}/`;
    const [labelAverages, setLabelAverages] = useState({});

    // data 보내는 함수
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

    // timestamp -> 시분초 바꿔주는 함수
    const convertTimestampToTime = (timestamp) => {
        const date = new Date(timestamp);

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // 시, 분, 초를 문자열로 반환
        const formattedTime = `${hours} : ${minutes} : ${seconds}`;

        return formattedTime;
    };

    const getHistoryDetail = async () => {
        const sendingData = { user_no: user.user_no };
        const recieveData = await submit(
            sendingData,
            `${BASEURL}learn/communication/history/${historyId}/`
        );
        // console.log("history list", recieveData);
        return recieveData;
    };

    useEffect(() => {
        const fetchData = async () => {
            // 비동기로 데이터를 가져옴
            const recieveData = await getHistoryDetail();
            setHistoryDetail(recieveData);

            // 데이터 순회하며 레이블 값 누적
            if (Object.keys(recieveData).length > 1) {
                recieveData.history.slice(1).forEach((entry) => {
                    if (entry.speaker === "user") {
                        const labels = entry.labels;
                        Object.keys(labels).forEach((label) => {
                            if (labels[label] !== 0) {
                                labelSums[label] += labels[label];
                                labelCounts[label] += 1;
                            }
                        });
                    }
                });
            }

            // 각 레이블의 평균 계산
            // console.log(labelSums, labelCounts);
            let temp = {};
            Object.keys(labelSums).forEach((label) => {
                temp[label] =
                    labelCounts[label] > 0
                        ? labelSums[label] / labelCounts[label]
                        : 0;
            });

            setLabelAverages(temp);
        };
        // console.log(labelAverages);

        fetchData();
    }, [historyId]);

    return (
        <div className="history_wrapper">
            <div className="history_contents">
                <div className="history_communicaiton_chatbot_container">
                    <div className="history_title">
                        <div className="history_title_inner">{`${historyDetail.history_no}: ${historyDetail.title}`}</div>
                    </div>
                    <div className="history_chat_messages">
                        {Object.keys(historyDetail).length > 0 &&
                            historyDetail.history.map((message, index) => (
                                <div className="history_chat_messages_inner">
                                    {message.speaker === "chatbot" ? (
                                        <div className="history_chat_messages_inner2">
                                            <div
                                                key={index}
                                                className={`history_message_${message.speaker} history_message`}
                                            >
                                                {message.sentence}
                                            </div>
                                            <div
                                                className={`message_time message_time_${message.speaker}`}
                                            >
                                                {convertTimestampToTime(
                                                    message.timestamp
                                                )}
                                            </div>
                                        </div>
                                    ) : message.speaker === "system" ? (
                                        <div className="history_chat_messages_inner2">
                                            <div
                                                key={index}
                                                className={`history_message_${message.speaker} history_message`}
                                            >
                                                {message.sentence}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="history_chat_messages_inner2">
                                            <div
                                                className={`message_time message_time_${message.speaker}`}
                                            >
                                                {convertTimestampToTime(
                                                    message.timestamp
                                                )}
                                            </div>
                                            <div
                                                key={index}
                                                className={`history_message_${message.speaker}_${message.check} history_message`}
                                            >
                                                {message.sentence}
                                            </div>
                                        </div>
                                    )}

                                    <div className="sevenC_wrapper">
                                        <div className="sevenC_wrapper_inner">
                                            {Object.entries(message.labels).map(
                                                ([key, value]) => (
                                                    <div
                                                        className={`sevenC${value} sevenC_inner`}
                                                        style={{
                                                            width: `${
                                                                value &&
                                                                value !== 0
                                                                    ? key.length *
                                                                      0.6
                                                                    : 0
                                                            }em`,
                                                        }}
                                                    >
                                                        {value && value !== 0
                                                            ? `${key}`
                                                            : null}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <hr />

                    <div className="history_score">
                        {Object.entries(labelAverages).map(([key, value]) => (
                            <div
                                className={`sevenC${value.toFixed()} sevenC_avg `}
                            >{`${key} : ${value.toFixed(2)}`}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="history_list">
                <CommunicationHistoryList
                    stopped={stopped}
                    stateN={stateN}
                    setStateN={setStateN}
                    setStopped={setStopped}
                    historyId={historyId}
                    setHistoryId={setHistoryId}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default CommunicationHistory;
