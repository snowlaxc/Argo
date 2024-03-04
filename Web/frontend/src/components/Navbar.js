/**
 * 일단 폐기... 추후 살릴지 고민
 */


import { useState } from "react";
import { Link } from "react-router-dom";
// import AuthContext from "../context/AuthContext";
import './Navbar.css'

// sanity check - 추후 완성되면 지우기
console.log("navbar");

// 좌측 중단 사이드 네비게이션 바
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  // const { user, logoutUser } = useContext(AuthContext);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="main-logo">
          <Link to="/" className="navbar-logo">
            <h1>Sidebar</h1>
          </Link>
        </div>
        <div >
          {/*
            로그인 관리.
            로그인 여부에 따라 보이는 내용이 다르도록
            IMPORTANT: 임시로 로그인 안한 상태로 보이도록 작업해둠.
            추후 !user -> user 로 변경 하기
          */}
          {
            <>
              <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                {/** nav bar items */}
                <li className="nav-item">
                  <Link to="/" className="nav-links" onClick={toggleNavbar}>
                    Home
                  </Link>
                </li>
                {/** 역량개발 페이지로 이동 TODO: 링크 추가 */}
                <li className="nav-item">
                  <Link to="/" className="nav-links" onClick={toggleNavbar}>
                    역량개발
                  </Link>
                </li>
                {/** 역량평가 페이지로 이동 TODO: 링크 추가 */}
                <li className="nav-item">
                  <Link to="/" className="nav-links" onClick={toggleNavbar}>
                    역량평가
                  </Link>
                </li>
                {/** 게시판으로 이동 TODO: 링크 추가 */}
                <li className="nav-item">
                  <Link to="/" className="nav-links" onClick={toggleNavbar}>
                    게시판
                  </Link>
                </li>
              </ul>
            </>
          }
        </div>
      </div>
    </header>
  );
};

export default Navbar;