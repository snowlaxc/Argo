import React, { useState, useEffect } from 'react';
import "./Pagination2.css";

const Pagination2 = ({ totalItems, itemsPerPage, pagesToShow, currentPage, setCurrentPage}) => {
    // 전체 페이지 수
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // 시작 페이지와 끝 페이지 계산
    const [indexOfFirstPage, setIndexOfFirstPage] = useState(Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1);
    const [indexOfLastPage, setIndexOfLastPage] = useState((Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1) + itemsPerPage - 1);

    const visiblePageNumbers = Array.from({ length: pagesToShow }, (_, index) => indexOfFirstPage + index)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages);

      // 페이지 변경 함수
    const changePage = (newPage) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        // const temp = Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1;
        setIndexOfFirstPage(Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1);
        setIndexOfLastPage(Math.min((Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1) + itemsPerPage - 1, totalPages));
        // console.log(currentPage, indexOfFirstPage, indexOfLastPage);
    }, [currentPage]);



    // 이전 페이지
    const prevPage = () => {
        if (currentPage > 1) {
        changePage(currentPage - 1);
        }

    };

    // 다음 페이지
    const nextPage = () => {
        if (currentPage < totalPages) {
        changePage(currentPage + 1);
        }

    };

    // 뒤 페이지
    const goBackPages = () => {
        changePage(Math.max(1, indexOfFirstPage - 1));

    };

    // 앞 페이지
    const goForwardPages = () => {
        changePage(Math.min(totalPages, indexOfLastPage + 1));

    };



    return (
        <div className="Pagination2_wrapper">
            <div className="Pagination2_wrapper2">
                {/* 첫 페이지로 이동 */}
                <a  onClick={() => goBackPages()} className="Pagination2_button">«</a>
                {/* 이전 페이지로 이동 */}
                <a onClick={() => prevPage()} className="Pagination2_button">‹</a>
                {/* 페이지 번호들 */}
                {visiblePageNumbers.map(number => (
                    <a key={number} onClick={() => changePage(number)} className={`Pagination2_button_num`} style={{width:`${number.toString().length}em`}}>{number}</a>
                ))}
                {/* 다음 페이지로 이동 */}
                <a onClick={() => nextPage()} className="Pagination2_button">›</a>
                {/* 마지막 페이지로 이동 */}
                <a onClick={() => goForwardPages()} className="Pagination2_button">»</a>
            </div>
        </div>
    );
};

export default Pagination2;