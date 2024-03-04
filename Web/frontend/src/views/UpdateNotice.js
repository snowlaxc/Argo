import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";

const UpdateNotice = () => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const api = useAxios();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(
                    `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/`
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
            const updatedNotice = {
                title,
                content,
            };

            const response = await api.put(
                `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/`,
                updatedNotice
            );

            if (response.status === 200) {
                navigate(`/NoticeDetail/${id}`);
            }
        } catch (error) {
            console.error("게시물 수정 중 오류 발생", error);
        }
    };

    return (
        <div className="update-post-container">
            <h2>게시물 수정</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>내용</label>
                    <textarea
                        rows="5"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
                <button type="submit">수정 완료</button>
            </form>
        </div>
    );
};

export default UpdateNotice;
