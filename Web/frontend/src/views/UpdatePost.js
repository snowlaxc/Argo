import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import "./UpdatePost.css";

const UpdatePost = () => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const api = useAxios();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(
                    `${process.env.REACT_APP_API_URL}/noticeboard/posts/${id}/`
                );
                if (response.status === 200 && response.data) {
                    setTitle(response.data.title);
                    setContent(response.data.content);
                }
            } catch (error) {
                console.error("게시물 정보를 불러오는 중 오류 발생", error);
            }
        };

        fetchPost();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedPost = {
                title,
                content,
            };

            const response = await api.put(
                `${process.env.REACT_APP_API_URL}/noticeboard/posts/${id}/`,
                updatedPost
            );

            if (response.status === 200) {
                navigate(`/PostDetail/${id}`);
            }
        } catch (error) {
            console.error("게시물 수정 중 오류 발생", error);
        }
    };

    return (
        <section>
            <div className="write-post-page-background">
                <div className="write-post-container">
                    <div className="write-post-form-container">
                        <h2 className="write-post-heading">게시물 수정</h2>
                        <form
                            onSubmit={handleSubmit}
                            className="write-post-form"
                        >
                            <div className="write-post-input-group">
                                <label className="write-post-label">제목</label>
                                <input
                                    type="text"
                                    value={title}
                                    className="write-post-title-input"
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="write-post-input-group">
                                <label className="write-post-label">내용</label>
                                <textarea
                                    rows="5"
                                    value={content}
                                    className="write-post-content-input"
                                    onChange={(e) => setContent(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="write-post-submit-group">
                                <button
                                    type="submit"
                                    className="write-post-submit-button"
                                >
                                    수정 완료
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpdatePost;
