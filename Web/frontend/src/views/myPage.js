import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./myPage.css";
import React, { useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";

const MyPage = ({ cat }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const api = useAxios(); // useAxios 훅 사용

    if (!user) {
        // console.log("redirect");
        return <Navigate to="/login" />;
    }

    const handlePasswordResetRequest = () => {
        // requestPasswordReset(user.email);
        navigate(`/profile/changePassword`);
    };

    // 회원 탈퇴 처리 함수
    const handleUserDeletion = async () => {
        if (window.confirm("정말로 회원 탈퇴를 원하시나요?")) {
            try {
                // useAxios 훅을 통해 delete 메소드 호출
                const response = await api.delete(
                    `${process.env.REACT_APP_API_URL}/api/users/${user.user_no}/`
                );

                if (response.status === 200) {
                    // 로그아웃 처리 및 로그인 페이지로 이동
                    // logout(); // 로그아웃 함수를 호출
                    logoutUser(); // 회원 탈퇴 후 로그아웃 처리
                    navigate("/login");
                }
            } catch (error) {
                console.error("회원 탈퇴 처리 중 오류가 발생했습니다.", error);
            }
        }
    };

    return (
        <section>
            <div id="mypage">
                <div id="myContentDiv">
                    <div id="myImgDiv">
                        <img src="data:image/jpeg;base64,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" />
                        {/* <div id="myImgBtn">
                <button>이미지 변경</button>
              </div> */}
                    </div>
                    <div id="myCard">
                        <span id="myName">{user.name}</span>
                        <button
                            onClick={handleUserDeletion}
                            className="delete-account-button"
                        >
                            회원 탈퇴
                        </button>
                        <div id="myLine" />
                        <div id="myProfile">
                            <div className="myProfileDiv">
                                <span>ID</span>
                                <span className="myData">{user.id}</span>
                            </div>

                            <div className="myProfileDiv">
                                <span>Password</span>
                                {/* <span><Link to="/profile/changePassword" id="open_changepw_btn">변경하기</Link></span> */}
                                <span>
                                    <button
                                        id="open_changepw_btn"
                                        onClick={handlePasswordResetRequest}
                                    >
                                        변경하기
                                    </button>
                                </span>
                            </div>

                            <div className="myProfileDiv">
                                <span>PhoneNumber</span>
                                <span className="myData">{user.phone}</span>
                            </div>

                            <div className="myProfileDiv">
                                <span>Email</span>
                                <span className="myData">{user.email}</span>
                            </div>

                            <div className="myProfileDiv">
                                <span>Dept</span>
                                <span className="myData">
                                    {user.dept === 1
                                        ? "개발부"
                                        : user.dept === 2
                                        ? "인사부"
                                        : user.dept === 3
                                        ? "기획부"
                                        : "기타"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MyPage;
