import "./QuestionList.css";
import React, { useEffect, useState, useContext } from "react";
import Pagination from "./Pagination";
import AuthContext from "../context/AuthContext";

const QuestionList = ({ cat, historyId, setHistoryId, isstudy }) => {
    const { user } = useContext(AuthContext);
    const [wrongList, setWrongList] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageWindow, setCurrentPageWindow] = useState(1);
    const itemsPerPage = 4;
    const pagesToShow = 5;
    const [searchContent, setSearchContent] = useState("");

    const changeWrongQuestion = (result_no) => {
        setHistoryId(result_no);
    };

    const searchWrongQuestion = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/learn/searchList/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        search: searchContent,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setWrongList(data.wrong_question_list);
                setCurrentPage(1); // 검색 결과가 바뀌었으므로 현재 페이지를 1로 초기화
            } else {
            }
        } catch (error) {}
    };

    useEffect(() => {
        const getWrongList = async () => {
            //틀린문제 리스트
            // currPage 보내주기
            const response1 = await fetch(
                `${process.env.REACT_APP_API_URL}/learn/wronglist/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...cat,
                        user_no: user.user_no,
                    }),
                }
            );
            const data1 = await response1.json();

            if (response1.ok) {
                const sortedQuestionList = data1.wrong_question_list.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                setWrongList(sortedQuestionList);
            } else {
            } //틀린문제 리스트 끝
        };

        getWrongList();
    }, [isstudy]);

    const currentItems = wrongList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div id="q_list">
            <div id="searchCenter">
                <div id="searchInputDiv">
                    {/* 다른 데이터도 들어와야 함 */}
                    <input
                        id="searchInput"
                        onChange={(e) => setSearchContent(e.target.value)}
                    />
                    <div id="searchBtnDiv">
                        <button type="button" onClick={searchWrongQuestion}>
                            <img
                                id="searchWrongImg"
                                src="https://cdn-icons-png.flaticon.com/128/49/49116.png"
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div id="q_container">
                {/* 클릭하면 오답노트쪽이 해당 문제로 바뀜 */}
                {Array.isArray(currentItems) &&
                    currentItems.map((item) => (
                        <div
                            key={item.question_no}
                            className="q_content"
                            onClick={() => changeWrongQuestion(item.result_no)}
                        >
                            <p>
                                {item.question_no}. {item.content}
                            </p>
                        </div>
                    ))}
            </div>
            <div>
                <Pagination
                    totalItems={wrongList.length}
                    itemsPerPage={itemsPerPage}
                    pagesToShow={pagesToShow}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default QuestionList;
