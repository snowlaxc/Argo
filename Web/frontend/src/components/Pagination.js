import React, { useState, useEffect } from 'react';
import "./Pagination.css"

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = [];
  
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(i); // 모든 페이지 번호를 추가
    }
  
    const goToPage = (number) => {
      setCurrentPage(number); // 함수 호출 변경
    };

    // 페이지 번호 배열 생성



    return (
        <div className="pagination_container">
            <div className="pagination">
                {/* 첫 페이지로 이동 */}
                <a onClick={() => goToPage(1)} className="pagination-link pagination_arrow">«</a>
                {/* 이전 페이지로 이동 */}
                <a onClick={() => goToPage(Math.max(1, currentPage - 1))} className="pagination-link pagination_arrow">‹</a>
                {/* 페이지 번호들 */}
                {pageNumbers.map(number => (
                    <a key={number} onClick={() => goToPage(number)} className={`pagination-link ${currentPage === number ? 'currunt_page' : ''}`}>{number}</a>
                ))}
                {/* 다음 페이지로 이동 */}
                <a onClick={() => goToPage(Math.min(pageCount, currentPage + 1))} className="pagination-link pagination_arrow">›</a>
                {/* 마지막 페이지로 이동 */}
                <a onClick={() => goToPage(pageCount)} className="pagination-link pagination_arrow">»</a>
            </div>
        </div>
    );
};

export default Pagination;