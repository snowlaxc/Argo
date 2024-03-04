import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAxios from "../utils/useAxios";
import Pagination from "../components/Pagination";
import AuthContext from "../context/AuthContext";
import "./NoticeBoard.css";

import "./NoticeBoard.css"
 
const NoticeBoard = () => {
  const [items, setItems] = useState([]); // 공지사항 또는 게시글 목록
  const [posts, setPosts] = useState([]); // 게시물 상태
  const [selectedTab, setSelectedTab] = useState('notices'); // 선택된 탭 상태
  const api = useAxios(); // 커스텀 Axios 훅을 사용하여 API 요청을 수행합니다.
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // useNavigate를 사용하여 navigate 함수를 가져옵니다.
  const [searchTerm, setSearchTerm] = useState('');
 
  
  useEffect(() => {
    // API request to retrieve data appropriate for the current page
    const offset = (currentPage - 1) * itemsPerPage;
 
    const fetchPosts = async () => {
      const endpoint = selectedTab === 'notices' ? '/notices/' : '/posts/';
      try {
        const response = await api.get(`${process.env.REACT_APP_API_URL}/noticeboard${endpoint}?limit=${itemsPerPage}&offset=${offset}`);
        if (response.status === 200 && Array.isArray(response.data)) {
          const data = [...response.data].reverse();
          if (selectedTab === 'notices') {
            setItems(data); // 공지사항 데이터 저장
          } else {
            setPosts(data); // 일반 게시글 데이터 저장
          }
        } else {
          console.error('Data is not an array', response.data);
        }
      } catch (error) {
        console.error('Error retrieving data', error);
      }
    };
 
    fetchPosts();
  }, [currentPage, selectedTab, itemsPerPage]); // currentPage도 의존성 배열에 추가
 
 
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
 
  const handleSearch = async () => {
    const endpoint = selectedTab === 'notices' ? '/notices/' : '/posts/';
    try {
      const response = await api.get(`${process.env.REACT_APP_API_URL}/noticeboard${endpoint}?search=${searchTerm}`);
      if (response.status === 200 && Array.isArray(response.data)) {
        const data = [...response.data].reverse();
        if (selectedTab === 'notices') {
          setItems(data);
        } else {
          setPosts(data);
        }
      } else {
        console.error('Data is not an array', response.data);
      }
    } catch (error) {
      console.error('Error retrieving data', error);
    }
  };
 
 
  const calculatePostNumber = (index) => {
    // 총 게시글 수에서 현재 페이지의 첫 번째 게시글 인덱스와 현재 게시글의 인덱스를 빼면 번호를 계산할 수 있습니다.
    // 예를 들어, 총 30개의 게시글이 있고, 현재 페이지가 2페이지(11~20번 게시글)이고, 현재 게시글이 15번째라면
    // 30 - (10 + 5) = 15가 됩니다.
    const totalPosts = selectedTab === 'notices' ? items.length : posts.length;
    return totalPosts - (indexOfFirstItem + index);
  };
 
 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = selectedTab === 'notices'
  ? items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) // 공지사항에 대한 페이지네이션 적용
  : posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // 일반 게시물에 대한 페이지네이션 적용
 
  return (
    <div id="noticeboard">
      {/* 탭 버튼들 */}
      <div className="tab-buttons">
        <button
        onClick={() => setSelectedTab('notices')}
        style={{ textDecoration: selectedTab === 'notices' ? 'underline' : 'none' }}>
          공지사항
        </button>
        <button
        onClick={() => setSelectedTab('posts')}
        style={{ textDecoration: selectedTab === 'posts' ? 'underline' : 'none' }}>
          게시글
        </button>
      </div>
      <div className="search-bar">
        <input type="text" placeholder="검색" value={searchTerm} onChange={handleSearchChange}/>
        <button onClick={handleSearch}>검색</button>
      </div>
      <div className="table-container">
                <table id="noticeboard_table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <tr
                                key={item.id}
                                onClick={() =>
                                    navigate(
                                        selectedTab === "posts"
                                            ? `/PostDetail/${item.post_id}/`
                                            : `/NoticeDetail/${item.notice_id}`
                                    )
                                }
                            >
                                <td id="board_no">
                                    {calculatePostNumber(index)}
                                </td>
                                <td className="text_left">
                                    <Link
                                        to={
                                            selectedTab === "posts"
                                                ? `/PostDetail/${item.post_id}/`
                                                : `/NoticeDetail/${item.notice_id}`
                                        }
                                    >
                                        {item.title}
                                    </Link>
                                </td>
                                <td>{item.user_id}</td>
                                <td id="board_date">
                                    {new Date(
                                        item.timestamp
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
      </div>
      {/* 글쓰기 버튼 - 관리자인 경우에만 공지사항 탭에서 보이도록 수정 */}
      {selectedTab === 'posts' || (selectedTab === 'notices' && user.is_admin) ? (
        <div className="write-button">
          <Link to="/writepost">글쓰기</Link>
        </div>
      ) : null}
      {/* 페이지네이션 */}
      <div className='board_pagination'>
        <Pagination
          totalItems={selectedTab === 'notices' ? items.length : posts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
 
export default NoticeBoard;