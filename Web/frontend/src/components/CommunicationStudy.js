import "./CommunicationSummary.css";
import CommunicationChatbot from "../components/CommunicationChatbot";

const CommunicationStudy = ({stopped, stateN, setStateN, setStopped}) => {
  return (
    <div style={{width:'100%'}}>
        <CommunicationChatbot stopped={stopped} stateN={stateN} setStateN={setStateN} setStopped={setStopped} />
    </div>
  )
}

export default CommunicationStudy;