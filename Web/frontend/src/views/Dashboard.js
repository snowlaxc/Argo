import React from 'react';
import { useContext} from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import NoticeBoard from '../components/NoticeBoard';
import Pagination from '../components/Pagination';
import "./Dashboard.css"

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // console.log("redirect");
        return <Navigate to="/login" />;
    }
    return (
        <section className='dashboard_div'>
            <div className='noticeboard_div'>
                {/* <HeaderMenu /> */}
                <NoticeBoard />
            </div>
        </section>
    );
};

export default Dashboard;