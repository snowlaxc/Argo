import React, { useState,useRef  } from 'react';
import './chat.css';
import ChatHistory from '../components/ChatHistory';
import ChatPageChatbot from '../components/ChatPageChatbot';

const Chat = () => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedChatContent, setSelectedChatContent] = useState(null);
  const [selectedTitle, setSelectedSessionTitle] = useState(null);
  const chatbotRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const handleSessionSelect = async (sessionId, chatContent, sessionTitle) => {
    if (chatbotRef.current) {
      await chatbotRef.current.saveChatSession();
    }
    setSelectedSessionId(sessionId);
    setSelectedChatContent(chatContent);
    setSelectedSessionTitle(sessionTitle);
  };

  const handleCreateNewChat = () => {
    if (chatbotRef.current) {
      chatbotRef.current.saveChatSession();
    }
    if (chatHistoryRef.current) {
      chatHistoryRef.current.fetchSessions();
    }
    setSelectedSessionId(null);
    setSelectedChatContent(null);
    setSelectedSessionTitle(null);
  };


  return (
    <div className="chat-chat-container">
      <ChatHistory onSessionSelect={handleSessionSelect} onCreateNewChat={handleCreateNewChat} selectedSessionId={selectedSessionId} ref={chatHistoryRef} chatbotRef={chatbotRef} />
      <ChatPageChatbot ref={chatbotRef} id={selectedSessionId} chatContent={selectedChatContent} sessionTitle={selectedTitle} />
    </div>
  );
};

export default Chat;