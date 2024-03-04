import React, { useState, useEffect, useContext, forwardRef } from "react";
import "./ChatHistory.css";
import AuthContext from "../context/AuthContext";
import _ from "lodash";

const ChatHistory = forwardRef(
    (
        { onSessionSelect, onCreateNewChat, selectedSessionId, chatbotRef },
        ref
    ) => {
        const [sessions, setSessions] = useState([]);
        const { user } = useContext(AuthContext);
        const [creatingNewChat, setCreatingNewChat] = useState(false);

        const fetchSessions = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/chatbot/api/chat-sessions/?user_no=${user.user_no}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch sessions");
                }
                const data = await response.json();
                setSessions(data);
            } catch (error) {
                console.error("Error fetching sessions:", error);
            }
        };

        useEffect(() => {
            if (user && user.user_no) {
                setTimeout(() => {
                    fetchSessions();
                }, 500);
            }
        }, [user]);

        const handleSessionClick = async (id) => {
            if (selectedSessionId === id) {
                return;
            }
            if (ref && ref.current) {
                await ref.current.saveChatSession();
            }
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/chatbot/api/chat-sessions/${id}/`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch session data");
                }
                const data = await response.json();

                if (onSessionSelect) {
                    onSessionSelect(
                        data.id,
                        data.chat_content,
                        data.session_title
                    );
                }
            } catch (error) {
                console.error("Error fetching session data:", error);
            }
            setTimeout(() => {
                fetchSessions();
            }, 100);
        };
        const handleDeleteSession = async (sessionId) => {
            if (window.confirm("채팅방을 삭제하시겠습니까?")) {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/chatbot/api/chat-sessions/${sessionId}/`,
                        {
                            method: "DELETE",
                        }
                    );
                    if (!response.ok) {
                        throw new Error("Failed to delete session");
                    }
                    fetchSessions();
                    if (
                        sessionId === selectedSessionId &&
                        chatbotRef &&
                        chatbotRef.current
                    ) {
                        chatbotRef.current.resetChat();
                    }
                } catch (error) {
                    console.error("Error deleting session:", error);
                }
            }
        };
        const handleCreateNewChatDebounced = _.debounce(() => {
            handleCreateNewChat();
        }, 500);
        const handleCreateNewChat = async () => {
            if (creatingNewChat) return;

            if (ref && ref.current) {
                await ref.current.saveChatSession();
            }
            setCreatingNewChat(true);
            onCreateNewChat();

            setTimeout(() => {
                fetchSessions();
                setCreatingNewChat(false);
                if (onSessionSelect) {
                    onSessionSelect(null, null, null);
                }
            }, 500);
        };

        return (
            <div className="session-list">
                <div className="session-items-container">
                    {sessions.map((session) => (
                        <div key={session.id} className="session-item">
                            <button
                                key={session.id}
                                onClick={() => handleSessionClick(session.id)}
                                className="session-button"
                            >
                                {session.session_title}
                            </button>
                            <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="delete-session"
                            >
                                <img
                                    src={"/delete_icon.png"}
                                    alt="Delete"
                                    className="delete-icon"
                                />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    className="create-new-chat-button"
                    onClick={handleCreateNewChat}
                >
                    <img
                        src={"/plus_icon.png"}
                        alt="Plus"
                        className="plus-icon"
                    />
                </button>
            </div>
        );
    }
);
export default ChatHistory;
