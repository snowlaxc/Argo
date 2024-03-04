// App.js
import React, { useState, useContext } from "react";
import "./index.css";
import "./App.css";
import Footer from "./components/Footer";
import HeaderMenu from "./components/HeaderMenu";
import { BrowserRouter as Router,  Routes,  Route} from "react-router-dom";
// import PrivateRoute from "./utils/PrivateRoute"
import { AuthProvider } from "./context/AuthContext";

import Home from "./views/homePage";
import Login from "./views/loginPage";
import Register from "./views/registerPage";
import ProtectedPage from "./views/protectedPage";
import FindId from "./views/find/findIdPage";
import FindPw from "./views/find/findPwPage";
import Dashboard from "./views/Dashboard";
import WritePost from './views/WritePost';
import Chatbot from "./components/Chatbot";
import Chat from "./views/chat";
import CommunicationPage from "./views/CommunicationPage";
import LearningPage from "./views/learningPage";
import LearnCommonSense from "./views/learn_other/learnCommonSense";
import LearnEthic from "./views/learn_other/learnEthic";
import LearnOccupation from "./views/learn_other/learnOccupation";
import LearnTools from "./views/learn_other/learnTools";
import MyPage from "./views/myPage";
import NoticeDetail from "./views/NoticeDetail"
import PostDetail from "./views/PostDetail";
import UpdateNotice from "./views/UpdateNotice";
import UpdatePost from "./views/UpdatePost";
import ResultPage from "./views/resultPage";
import ChangePassword from "./views/changePassword";

function App() {
  return (
    <Router>
      {/* <div className="flex flex-col min-h-screen overflow-hidden"> */}
      <div className="App">
        <AuthProvider>
        
          <HeaderMenu />
          {/* <Navbar /> */}
          <Routes>
            <Route path="/login"  element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/findId" element={<FindId />} />
            <Route path="/findPw" element={<FindPw />} />
            
            <Route path="/learn/communication" element={<CommunicationPage />} />
            <Route path="/learn" element={<LearningPage />} />
            <Route path="/learn/ethic" element={<LearnEthic />} />
            <Route path="/learn/commonsense" element={<LearnCommonSense />} />
            <Route path="/learn/occupation" element={<LearnOccupation />} />
            <Route path="/learn/tools" element={<LearnTools />} />

            <Route path="/profile" element={<MyPage />} />
            <Route path="/profile/changePassword" element={<ChangePassword />} />
            <Route path="result" element={<ResultPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/writepost" element={<WritePost />} />
            <Route path="/PostDetail/:id" element={<PostDetail />} />
            <Route path="/UpdatePost/:id/" element={<UpdatePost />} />
            <Route path="/UpdateNotice/:id/" element={<UpdateNotice />} />
            <Route path="/NoticeDetail/:id/" element={<NoticeDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/NoticeDetail/:id/" element={<NoticeDetail />} />

          </Routes>
          <Footer />
        </AuthProvider>
      </div>
    </Router>
  )
}


export default App

/* <PrivateRoute component={ProtectedPage} path="/protected" exact /> */