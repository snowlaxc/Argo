import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import Pagination from "./Pagination2";

const CommunicationHistoryList = ({
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
    const itemsPerPage = 5;
    const pagesToShow = 5;
    // const [currentPage, setCurrentPage] = useState(1);
    const [currentPageWindow, setCurrentPageWindow] = useState(1);
    // const [historys, setHistorys] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const BASEURL = `${process.env.REACT_APP_API_URL}/`;

    const tempMax = 100;

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

    const fetchHistoryList = async () => {
        const sendingData = { user_no: user.user_no };
        const recieveData = await submit(
            sendingData,
            `${BASEURL}learn/communication/history/`
        );
        setHistoryList(recieveData);
        // console.log("history list", recieveData);
    };

    // todo : get data from "learn/communication/history"
    useEffect(() => {
        // API request to retrieve data appropriate for the current page
        const offset = (currentPageWindow - 1) * itemsPerPage;
        // if (stateN !== 0) {
        //   fetchHistoryList();
        // }

        fetchHistoryList();
    }, []);

    const currentItems = historyList
        ? historyList.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
          )
        : [];

    useEffect(() => {
        // console.log(currentPage)
    }, [currentPage]);

    const goToHistory = (history_id) => {
        setStateN(1);
        setHistoryId(history_id);
        // console.log("Clicked goToHistory");
    };

    return (
        <div className="comm_history_wrapper">
            {currentItems.map(({ history_no, title, code }) => (
                <div className="comm_history_element" key={history_no}>
                    <a
                        onClick={() => {
                            goToHistory(history_no);
                        }}
                    >{`${history_no}: ${title}`}</a>
                </div>
            ))}
            <Pagination
                totalItems={historyList ? historyList.length : 0}
                itemsPerPage={itemsPerPage}
                pagesToShow={pagesToShow}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
};

export default CommunicationHistoryList;
