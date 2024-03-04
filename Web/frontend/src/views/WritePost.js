import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import AuthContext from "../context/AuthContext";
import "./WritePost.css"

const WritePost = () => {
    const { user } = useContext(AuthContext); // 현재 로그인한 사용자 정보를 가져옵니다.
    const [title, setTitle] = useState(""); // 게시물 제목 상태
    const [content, setContent] = useState(""); // 게시물 내용 상태
    const [files, setFiles] = useState([]); // 파일들을 저장할 상태
    const [isNotice, setIsNotice] = useState(false); // 관리자가 공지사항 여부를 결정할 수 있는 상태
    const navigate = useNavigate(); // React Router의 네비게이션 함수
    const api = useAxios(); // 커스텀 Axios 훅을 사용하여 API 요청을 수행합니다.

    // 게시물 제출 핸들러
    const handleSubmit = async (e) => {
        try {
            e.preventDefault(); // 폼 제출 기본 동작을 막습니다.

            let formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("user_no", user.user_no);
            if (files.length > 0) {
                // 파일이 있을 때만 파일 데이터를 추가
                for (let i = 0; i < files.length; i++) {
                    formData.append("file_field_name", files[i]);
                    formData.append("file_name", encodeURIComponent(files[i].name));
                }
            }
            for (let key of formData.keys()) {
                console.log(key, formData.getAll(key));
            }
            if (user.is_admin) {
                const endpoint = isNotice ? "/notices/" : "/posts/";
                try {
                    const response = await api.post(
                        `${process.env.REACT_APP_API_URL}/noticeboard${endpoint}`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    if (response.status === 201) {
                        navigate("/Dashboard");
                    }
                } catch (error) {
                    console.error("게시물 작성 오류", error);
                }
            } else {
                try {
                    const response = await api.post(
                        `${process.env.REACT_APP_API_URL}/noticeboard/posts/`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    if (response.status === 201) {
                        navigate("/Dashboard");
                    }
                } catch (error) {
                    console.error("게시물 작성 오류", error);
                }
            }
        } catch (error) {
            console.error("오류 발생", error);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files); // 여러 파일 업로드를 처리
    };

    return (
        <section>
            <div className="write-post-page-background">
                <div className="write-post-container">
                    <div className="write-post-form-container">
                        <h2 className="write-post-heading">새 게시물 작성</h2>
                        <form onSubmit={handleSubmit} className="write-post-form">
                            <div className="write-post-input-group">
                                <label htmlFor="postTitle" className="write-post-label">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    id="postTitle"
                                    className="write-post-title-input"
                                    placeholder="제목을 입력하세요"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>


                            <div className="write-post-input-group">
                                <label htmlFor="postContent" className="write-post-label">
                                    내용
                                </label>
                                <textarea
                                    id="postContent"
                                    className="write-post-content-input"
                                    placeholder="내용을 입력하세요"
                                    rows="10"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    />
                            </div>

                            <div className="write-post-input-group">
                                <label htmlFor="postFile" className="write-post-label">
                                    파일
                                </label>
                                <input
                                    type="file"
                                    id="postFile"
                                    className="write-post-file-input"
                                    accept=".jpg, .jpeg, .png, .gif, .pdf, .hwp, .xlsx, .docx, .ppt, .txt" // 허용할 파일 형식 지정
                                    onChange={handleFileChange} // 파일 선택 핸들러 연결
                                    multiple
                                />
                            </div>

                            {/* 관리자만 볼 수 있는 공지사항 체크박스 */}
                            {user.is_admin && (
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                    />
                                    공지사항 작성
                                </label>
                            )}
                            <div className="write-post-submit-group">
                                <button
                                    type="submit"
                                    className="write-post-submit-button"
                                >
                                    작성 완료
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WritePost;
