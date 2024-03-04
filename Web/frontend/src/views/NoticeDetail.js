import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../utils/useAxios";
import AuthContext from "../context/AuthContext";
import "./NoticeDetail.css";

const NoticeDetail = () => {
    const { id } = useParams();
    const [Notice, setNotice] = useState({
      "notice_files": ""
    });
    const [comments, setComments] = useState([]); // 댓글 목록 상태
    const [newComment, setNewComment] = useState(""); // 새 댓글 입력 상태
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [editingComment, setEditingComment] = useState(null);
    const api = useAxios();

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const response = await api.get(
                    `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/`
                );
                if (response.status === 200 && response.data) {
                    setNotice(response.data);
                    console.log(response.data);
                } else {
                    console.error("응답 오류:", response);
                }

                // 공지사항 댓글 데이터를 불러오는 요청으로 수정
                const commentsResponse = await api.get(
                    `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/comments/`
                );
                if (commentsResponse.status === 200 && commentsResponse.data) {
                    setComments(commentsResponse.data);
                }
            } catch (error) {
                console.error("게시물 가져오기 오류", error);
            }
        };
        fetchPostAndComments();
    }, []);

    const handleDelete = async () => {
        try {
            // Axios를 사용하여 DELETE 요청을 보냅니다.
            const response = await api.delete(
                `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/noticedelete/`
            );

            // 응답 상태 코드가 성공적인 경우 (예: 200, 204)
            if (response.status === 200 || response.status === 204) {
                console.log("게시물이 성공적으로 삭제되었습니다.");

                // 게시물 삭제 후 다른 페이지로 이동하거나, 목록을 업데이트하는 로직을 추가할 수 있습니다.
                navigate("/DashBoard"); // 게시판 목록 페이지로 이동
            }
        } catch (error) {
            console.error("게시물 삭제 중 오류 발생", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const commentData = {
                content: newComment,
                notice_id: id, // 공지사항 ID로 수정
                user_no: user.user_no,
                user_id: user.user_id
            };
            // 새로운 댓글 작성 API 요청으로 수정
            const response = await api.post(
                `${process.env.REACT_APP_API_URL}/noticeboard/notices/${id}/comments/`,
                commentData
            );
            if (response.status === 201) {
                setComments([...comments, response.data]);
                setNewComment("");
            }
        } catch (error) {
            console.error(
                "댓글 작성 중 오류 발생",
                error.response ? error.response.data : error.message
            );
        }
    };

    const handleEdit = () => {
        navigate(`/UpdateNotice/${id}/`); // 올바른 경로 이름으로 수정
    };

    // 댓글 삭제 핸들러
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await api.delete(
                `${process.env.REACT_APP_API_URL}/noticeboard/notices/${commentId}/delete/`
            );
            if (response.status === 200 || response.status === 204) {
                setComments(
                    comments.filter((comment) => comment.comm_no !== commentId)
                );
            }
        } catch (error) {
            console.error("댓글 삭제 중 오류 발생", error);
        }
    };

    // 댓글 수정 핸들러
    const handleEditComment = (comment) => {
        setEditingComment({ id: comment.comm_no, content: comment.content });
    };

    const handleUpdateComment = async (commentId, content) => {
        try {
            const response = await api.put(
                `${process.env.REACT_APP_API_URL}/noticeboard/notices/${commentId}/update/`,
                { content }
            );
            if (response.status === 200) {
                // 댓글 목록에서 해당 댓글을 업데이트합니다.
                setComments(
                    comments.map((comment) => {
                        if (comment.comm_no === commentId) {
                            return { ...comment, content };
                        }
                        return comment;
                    })
                );
                // 수정 모드를 종료합니다.
                setEditingComment(null);
            }
        } catch (error) {
            console.error("댓글 수정 중 오류 발생", error);
        }
    };

    const handleBoard = () => {
        navigate("../DashBoard");
    };

  return (
    <section id="postdetail_section">
      <div className="post-container">
        <button className="delete-btn" onClick={handleBoard}>목록</button>
        {(user.user_no === Notice.user_no || user.is_admin) && (
        <button className="delete-btn" onClick={handleDelete}>삭제</button>
        )}
        {user.user_no === Notice.user_no && (
        <button className="edit-btn" onClick={handleEdit}>수정</button>
        )}
        <div className='post_content_div'>
          <div className="board_name">공지사항</div>
          <span className="title">{Notice.title}</span>
          <div className='data'>
          <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAIVBMVEXY2Njz8/Pq6urv7+/h4eHb29vo6Oje3t7j4+Pt7e3p6ekmc3lwAAADMElEQVR4nO2bC3KDMAxEMeab+x+4JZQBEkhBlq2NZt8JvGOtPkZUFSGEEEIIIYQQQgghhBBCCCEEnXbo6hjDLzHW3dBan0dEO9ThjfrrxDQHKv60NNZnu0ETz2Q8w+xbpPQfZTyl9NZnvEB7GlS7AIP3SnNFxgR4fHVXdYTQWZ/1A+14XUcII2x4tf+6fE8EVXJXB6qS+zpAldzyx8Jofep3buSrLXC563L9eAWsnrRSHSFg2eRSX3JMbX32Lb1cRwhIHaQg865E69OviJ0+g+P3pAsBupLEC8G5koSUNQOSuBJqyAJGLRnShQzWGp4kRxZKbKXrCMFaw4SCRTBMomARDJMIB5E9CGOJgtcx3J7Yn8wgdCluhGjogMi/FEIhmXBjdjdC3BRENy2Km6bRTRvvZrDyM+q6eXxw8xzk5oHOz5Opm0dsP58V3Hzo8fPpzc3HUD+fp90sDPhZ4fCzVONnzcnN4pmfVUA/y5mVm3XZys8Cs5+V8srNkv+Ek98uJpz8CDPh5NekGRc/ixFCCCHky2mb4TGO8cLkHuM4PoYGsGfph1r0Ih/rAWc2Oexz74DRE59PHre0GE8pvcoiykxnF2O96Ln3nNFGSqMs4ymlfIT9/1Qio/ADS6vojVe6gilMZUXrnFKbKfeeqiWUed5OXti4QgHTZ3THltxv9fnDaiFveOVKukfkTMRJmxr3yaakiM23ZLJ8cR2ZlBjoyKKksD8W1H1ipENdiWQ/QwflrYJidfAd1b2bQn3JMYrdiknCWlFLXSo/VqSgZRNDg8wo2STzPHgFlZnRPLAmNILLNGMtKGQus5K+J73Am5X0PckL9MYlZCW1mJin3oXEFAzikIk0l8BcSOKVAF1I2pVA1JCFlFpiffY9ch0wuXdGnoFVvnPqIf6JCaJd3CJtHQH69z3Sbh4ssuSxZX3ud2Q6oKrhjKwmwllEahI4i0hNAjJSbZGNV9anPkKiA64cTkhKIlijNSNptwCTlixtPawPfcRDIARoyl2RzLtuhACWEVkhcSPE+szHUAgaFIIGhaBBIWhQCBoUggaFoEEhaFAIGhSCBoWgQSFoUAgap8f9Ac1KQOtCVp1TAAAAAElFTkSuQmCC'/>
            <span>{Notice.user_id}</span>
            <span className='board_line'>|</span>
          <span className='color_gray'>{new Date(Notice.timestamp).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            {/* 파일 다운로드 링크 추가 */}
            {Notice.notice_files? 
              <span className='noticepost_file'>
                  {Notice.notice_files && Notice.notice_files.map((file, index) => (
                      <span key={index}>
                          <a className="file-link" href={`${process.env.REACT_APP_API_URL}/media/notice_uploads/${encodeURIComponent(file.name)}`} download>{file.name}</a> {/* 파일 이름 표시 및 다운로드 링크 제공 */}
                          {/* <div>{`${file.src}`}</div> */}
                      </span>
                  ))}
              </span>
              :
              <span></span>
            }
          </div>
          <p className="content">{Notice.content}</p>
        </div>

        {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                className='postdetail_textarea'
                placeholder='댓글을 입력하세요'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea><br/>
              <div className='comm_submit_div'><button className="submit-comment-btn" type="submit">댓글 작성</button></div>
            </form>
          )}

      <div className='comment_container_div'>
          {comments.map((comment) => (
          <div key={comment.comm_no} className="comment-container">
              {editingComment && editingComment.id === comment.comm_no ? (
              // 수정 모드 활성화
              <div>
                <input
                type="text"
                className='comment-edit-input'
                value={editingComment.content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                />
                <button className='comp_edit_btn' onClick={() => handleUpdateComment(editingComment.id, editingComment.content)}>수정 완료</button>
              </div>
              ) : (
              // 기본 댓글 표시
              <div className="comment-content">
                <div className='comm_cont_id_div'>
                  <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAIVBMVEXY2Njz8/Pq6urv7+/h4eHb29vo6Oje3t7j4+Pt7e3p6ekmc3lwAAADMElEQVR4nO2bC3KDMAxEMeab+x+4JZQBEkhBlq2NZt8JvGOtPkZUFSGEEEIIIYQQQgghhBBCCCEEnXbo6hjDLzHW3dBan0dEO9ThjfrrxDQHKv60NNZnu0ETz2Q8w+xbpPQfZTyl9NZnvEB7GlS7AIP3SnNFxgR4fHVXdYTQWZ/1A+14XUcII2x4tf+6fE8EVXJXB6qS+zpAldzyx8Jofep3buSrLXC563L9eAWsnrRSHSFg2eRSX3JMbX32Lb1cRwhIHaQg865E69OviJ0+g+P3pAsBupLEC8G5koSUNQOSuBJqyAJGLRnShQzWGp4kRxZKbKXrCMFaw4SCRTBMomARDJMIB5E9CGOJgtcx3J7Yn8wgdCluhGjogMi/FEIhmXBjdjdC3BRENy2Km6bRTRvvZrDyM+q6eXxw8xzk5oHOz5Opm0dsP58V3Hzo8fPpzc3HUD+fp90sDPhZ4fCzVONnzcnN4pmfVUA/y5mVm3XZys8Cs5+V8srNkv+Ek98uJpz8CDPh5NekGRc/ixFCCCHky2mb4TGO8cLkHuM4PoYGsGfph1r0Ih/rAWc2Oexz74DRE59PHre0GE8pvcoiykxnF2O96Ln3nNFGSqMs4ymlfIT9/1Qio/ADS6vojVe6gilMZUXrnFKbKfeeqiWUed5OXti4QgHTZ3THltxv9fnDaiFveOVKukfkTMRJmxr3yaakiM23ZLJ8cR2ZlBjoyKKksD8W1H1ipENdiWQ/QwflrYJidfAd1b2bQn3JMYrdiknCWlFLXSo/VqSgZRNDg8wo2STzPHgFlZnRPLAmNILLNGMtKGQus5K+J73Am5X0PckL9MYlZCW1mJin3oXEFAzikIk0l8BcSOKVAF1I2pVA1JCFlFpiffY9ch0wuXdGnoFVvnPqIf6JCaJd3CJtHQH69z3Sbh4ssuSxZX3ud2Q6oKrhjKwmwllEahI4i0hNAjJSbZGNV9anPkKiA64cTkhKIlijNSNptwCTlixtPawPfcRDIARoyl2RzLtuhACWEVkhcSPE+szHUAgaFIIGhaBBIWhQCBoUggaFoEEhaFAIGhSCBoWgQSFoUAgap8f9Ac1KQOtCVp1TAAAAAElFTkSuQmCC'/>
                  <span>{comment.user_id}</span>
                </div>
                <div className='comm_cont_div'>
                  <span className='comment_content_content'>{comment.content}</span>
                  {user.user_no === comment.user_no && (
                    <button onClick={() => handleEditComment(comment)} className="comm_btn">수정</button>
                  )}
                  {(user.user_no === comment.user_no || user.is_admin) && (
                    <button onClick={() => handleDeleteComment(comment.comm_no)} className='comm_btn'>삭제</button>
                  )}
                </div>
                <div className='color_gray comm_timestamp'>
                  {new Date(comment.timestamp).toLocaleString('ko-KR', {
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
          </div>
              )}
          </div>
          ))} 
        <div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeDetail;
