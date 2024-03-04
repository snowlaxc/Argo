import React, {
    useState,
    useEffect,
    useRef,
    useContext,
    forwardRef,
    useImperativeHandle,
} from "react";
import "./ChatPageChatbot.css";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ChatPageChatbot = forwardRef(({ chatContent, id, sessionTitle }, ref) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [localSessionTitle, setLocalSessionTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const chatMessagesRef = useRef(null);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (id && chatContent) {
            setLocalSessionTitle(sessionTitle);
        }
    }, [id, chatContent, sessionTitle]);
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop =
                chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (chatContent) {
            try {
                const loadedMessages = JSON.parse(chatContent);
                setMessages(loadedMessages);
            } catch (error) {
                console.error("Error parsing chat session:", error);
            }
        }
    }, [chatContent, id]);
    const saveChatSession = async () => {
        if (!localSessionTitle || messages.length === 0) return;
        const chatContent = JSON.stringify(messages);
        let endpoint = `${process.env.REACT_APP_API_URL}/chatbot/api/chat-sessions/`;
        let method = "POST";

        if (id) {
            endpoint += `${id}/`;
            method = "PUT";
        }
        await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_no: user.user_no, // 사용자 no
                session_title: localSessionTitle, // 세션 제목
                chat_content: chatContent, // 채팅 내용
            }),
        }).then((response) => {
            if (!response.ok) {
                console.error("Error saving chat session");
                response.json().then((data) => console.log(data));
            }
        });
        setInput("");
        setMessages([]);
        setLocalSessionTitle("");
    };
    useImperativeHandle(ref, () => ({
        saveChatSession,
        resetChat: () => {
            setInput("");
            setMessages([]);
            setLocalSessionTitle("");
        },
    }));
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            saveChatSession();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [saveChatSession]);

    const handleMouseEnter = () => {
        chatMessagesRef.current.addEventListener("wheel", handleScroll);
    };

    const handleMouseLeave = () => {
        chatMessagesRef.current.removeEventListener("wheel", handleScroll);
    };

    const handleScroll = (event) => {
        event.preventDefault();
        chatMessagesRef.current.scrollTop += event.deltaY;
    };

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            if (isSubmitting) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const userMessage = { text: input, sender: "user" };
        const isFirstMessage = messages.length === 0;
        if (isFirstMessage) {
            setLocalSessionTitle("");
        }

        setMessages((currentMessages) => [...currentMessages, userMessage]);

        setInput("");

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/chatbot/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    is_first_message: isFirstMessage,
                }),
            });

            const data = await response.json();
            if (data.session_title) {
                setLocalSessionTitle(data.session_title);
            }
            setMessages((currentMessages) => [
                ...currentMessages,
                { text: data.reply, sender: "bot" },
            ]);
        } catch (error) {
            console.error("Error sending message to the chatbot API:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!user) {
        return <Navigate to="/login" />;
    }
    return (
        <div className="chatpage-chatbot-container">
            <div className="chatpage-chatbot-messages" ref={chatMessagesRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chatpage-chatbot-message ${message.sender}`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="chatpage-chatbot-input-container">
                <textarea
                    className="chatpage-chatbot-input"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="질문을 입력하세요"
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="chatpage-chatbot-submit"
                    onClick={handleSubmit}
                >
                    제출
                </button>
            </div>
        </div>
    );
});

export default ChatPageChatbot;
