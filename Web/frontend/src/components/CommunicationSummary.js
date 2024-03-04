import React, { useContext, useEffect, useState } from 'react';
import "./CommunicationSummary.css"
import RadarChart from "./RadarChart"
import AuthContext from "../context/AuthContext";
import CommunicationHistoryList from './CommunicationHistoryList';



const CommunicationSummary = ({stopped, stateN, setStateN, setStopped, historyId, setHistoryId, currentPage, setCurrentPage, score}) => {
  const { user } = useContext(AuthContext);

  // todo : get data from "learn/communication/score"
  const dataUser = Object.values(score).map(item => item.score);
  const dataAvg = Object.values(score).map(item => item.avg);


  return (
    <div className="radar_chart_wrapper">
      <div className="radar_chart">
        <RadarChart dataUser={dataUser} dataAvg={dataAvg} name={user.name} />
      </div>
      <div className="history_list">
        <CommunicationHistoryList stopped={stopped} stateN={stateN} setStateN={setStateN} setStopped={setStopped} historyId={historyId} setHistoryId={setHistoryId}  currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
    </div>
  )
}

export default CommunicationSummary