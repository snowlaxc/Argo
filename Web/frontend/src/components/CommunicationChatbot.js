import React, { useState, useEffect, useContext, useRef } from "react";
import "./CommunicationChatbot.css";
import "./CommunicationHistory.css";
import AuthContext from "../context/AuthContext";

const CommunicationChatbot = ({ stopped, stateN, setStateN, setStopped }) => {
    const { user } = useContext(AuthContext);
    const [input, setInput] = useState(""); // 사용자 입력을 저장
    const [messages, setMessages] = useState([]); // 메시지 목록을 저장
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [statecode, setStatecode] = useState(0); // 학습 상태를 나타냄. 0: 학습중, 1: chatbot 정상 종료, 2: chat 비정상 종료, 3: 사용자 종료(중단하기 눌렀을 때)
    const [isSaved, setIsSaved] = useState(false);
    // const [dialogId, setDialogId] = useState(null);
    // const [subject, setsubject] = useState('정보를 불러오는 중입니다...');
    const [answer, setAnswer] = useState({});
    const [sentenceOrder, setSentenceOrder] = useState(0);
    const containerRef = useRef(null);
    const BASEURL = `${process.env.REACT_APP_API_URL}/`;
    const [MAXCONVERSATION, setMAXCONVERSATION] = useState(50);

    // timestamp -> 시분초 바꿔주는 함수
    const convertTimestampToTime = (timestamp) => {
        const date = new Date(timestamp);

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // 시, 분, 초를 문자열로 반환
        const formattedTime = `${hours} : ${minutes} : ${seconds}`;

        return formattedTime;
    };

    const handleInputChange = (event) => {
        // 입력 필드가 변경될 때마다 실행되는 함수
        setInput(event.target.value);
    };

    // data 를 url 로 보내는 함수
    const submit = async (dataSend, url) => {
        let data;
        try {
            const response = await fetch(url, {
                // 백엔드 서버에 메시지를 POST 요청
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataSend),
            });

            data = await response.json(); // 백엔드로부터의 응답 받기
        } catch (error) {
            data = null;
            console.error("Error sending message to the chatbot API:", error);
        } finally {
            //
        }
        return data;
    };

    // 'Send' 버튼을 클릭하거나 엔터 키를 누를 때 실행하는 함수
    const handleSubmit = async () => {
        if (!input.trim()) return; // 입력이 비어있는 경우 메시지를 안보냄

        // 유저 메시지로  messages 업데이트
        const userMessage = { sentence: input, speaker: 'user', labels: {}, timestamp: new Date().getTime(), label_answer:answer.conversation[sentenceOrder].sevenC, guide: answer.conversation[sentenceOrder].guide, check: 2};
        setMessages((currentMessages) => { 
          return [...currentMessages, userMessage];
        });

        const inputtemp = input;
        setInput(""); // 입력 필드 비우기
        setIsButtonDisabled(true); // 버튼 비활성화

        // 가이드 확인
        const guide_label = answer.conversation[sentenceOrder].guide;
        const sendingData = { sentence: inputtemp, guideline: guide_label };
        const checkdata = await submit(
            sendingData,
            BASEURL + "learn/communication/study/check/"
        );
        const currentSentenceOrder = sentenceOrder;

        if (checkdata.check === 1) {
            // 가이드 모두 충족
            // messages 마지막 요소 check를 1로 변경
            setMessages((currentMessages) => {
                const lastMessageIndex = currentMessages.length - 1;
                const newMessages = [...currentMessages];
                newMessages[lastMessageIndex] = {
                    ...newMessages[lastMessageIndex],
                    check: 1,
                };
                return newMessages;
            });

            // 다음 conversation 진행 위치
            setSentenceOrder((currSentenceOrder) => {
                return currSentenceOrder + 1;
            });

            // chatbot 응답 보내기
            const sendingData = {
                answer: answer,
                user_no: user.user_no,
                message: inputtemp,
                history: messages,
            };
            const data = await submit(
                sendingData,
                BASEURL + "learn/communication/study/"
            );

          // chatbot 메시지로  messages 업데이트
          setMessages((currentMessages) => { 
            const message = { sentence: data.reply, speaker: "chatbot", labels: {}, guide:answer.conversation[currentSentenceOrder+1].guide,label_answer:[], timestamp: new Date().getTime(), check:1};
            return [...currentMessages, message];
          });
          
          // 다음 conversation 진행 위치
          setSentenceOrder((currSentenceOrder) => {
            return currSentenceOrder + 1;
          });

          // 학습 중일때만 (statecode===0) statecode 변경
          if(statecode===0) {
            setStatecode(data.code);
          }
        }
        else{
          // messages 마지막 요소 check를 0로 변경
          setMessages((currentMessages) => {
          const lastMessageIndex = currentMessages.length - 1;
          const newMessages = [...currentMessages];
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            check: 0
          };
          return newMessages;
          });
          // 유저 메시지와 시스템 메시지로  messages 업데이트
          setMessages((currentMessages) => { 
            // console.log(checkdata.guide_label, guide_label, checkdata.guide_label.filter((value, index) => value === 0));
            let message = "문맥과 맞지 않습니다.";
            if (checkdata.guide_label.includes(1)) {
              message = guide_label.filter((value, index) => checkdata.guide_label[index] === 0).map((value, _) => "'"+value+"'").join(', ') + " 부분이 부족합니다.";
            }
            const updatedMessages = [...currentMessages, { sentence: message, speaker: 'system', guide:[], labels: {},label_answer:[], timestamp: new Date().getTime(), check:1 }];
            return updatedMessages;
          });
        }

        // 학습 중일때만 (statecode===0) 버튼 다시 활성화
        if (statecode === 0) {
            setIsButtonDisabled(false);
        }
    };

    // 7C's 라벨링
    const getLabel = async (message) => {
        const sendingData = {
            user_no: user.user_no,
            message: message,
            history: messages,
        };
        const data = await submit(
            sendingData,
            BASEURL + "learn/communication/label/"
        );
        return data;
    };

    // 첫 렌더링 시 한번만 실행/ 백엔드에 첫 시작 메시지를 보내는 로직
    useEffect(() => {
        // 컴포넌트가 마운트되면 초기 챗봇 메시지를 보내는 로직 추가

        const handleFirstSubmit = async () => { 
          // 초기 <START> 메시지는 저장하지 않음.
          // const userMessage = { sentence: "<START>", speaker: 'user', labels: {}, timestamp: new Date().getTime() };
          const user_name = user.name? user.name: "NAME";
          const sendingData = {'user_no':user.user_no, 'user_name':user_name, message: "<START>"};
          
          // console.log(user);

            setIsButtonDisabled(true); // 버튼 비활성화
            const data = await submit(
                sendingData,
                BASEURL + "learn/communication/study/first/"
            );

            // answer 저장
            setAnswer(data.answer);
            setMAXCONVERSATION(data.answer.conversation.length);

            // chatbot 먼저 시작일 경우
            if (data.answer.conversation[0].speaker === "chatbot") {
                setSentenceOrder((currSentenceOrder) => {
                    return currSentenceOrder + 1;
                });

            setMessages((currentMessages) => { // 받은 데이터로 메시지 목록을 업데이트
              const updatedMessages = [...currentMessages, { sentence: data.reply, speaker: 'chatbot', labels: {}, timestamp: new Date().getTime(), guide: answer.conversation[sentenceOrder].guide, label_answer:[], check: 1 }];
              return updatedMessages;
            }); 
          }

        }

        handleFirstSubmit(); // 초기 메시지 보내기
    }, []);

    // statecode 가 0 이 아닐 때, history 저장 요청. 버튼 비활성화
    useEffect(() => {
        if (statecode != 0) {
            setIsButtonDisabled(true);
            // console.log(statecode, isSaved);
            if (!isSaved && messages.length > 1) {
                setIsSaved(true);
                const sendingData = {
                    dialog_id: answer.id,
                    user_no: user.user_no,
                    code: statecode,
                    title: answer.title,
                    timestamp: new Date().getTime(),
                    history: messages,
                };
                // console.log(sendingData);
                submit(sendingData, BASEURL + "learn/communication/save/");
            }

            setStopped(true);
        } else {
            setIsButtonDisabled(false);
        }
        // console.log(statecode);
    }, [statecode]);

    // 중단 버튼 눌렀을 때 disabled
    useEffect(() => {
        if (stopped) {
            setStatecode(3);
        }
    }, [stopped]);

    // useEffect(() => {
    //   if (sentenceOrder >= MAXCONVERSATION) {
    //     setStatecode(1);
    //   }
    // }, [sentenceOrder]);

    const senvenC2N = {
      0 : "Clear",
      1 : "Concise",
      2 : "Concrete",
      3 : "Correct",
      4 : "Coherent",
      5 : "Complete",
      6 : "Courteous",
    }

    useEffect(() => {
      // 발화자가 user 인 경우 label 얻기
      const fetchData = async () => {
        if (messages.length > 0) {
          const lastMessageIndex = messages.length - 1;
          const last = messages[lastMessageIndex];
          if (last && last.speaker === "user" && Object.keys(last.labels).length === 0) {
            const recieveData = await getLabel(last.sentence);

            const B = recieveData.labels;
            const A = last.label_answer;
            Object.keys(B).forEach(key => {
              if (!A.includes(key)) {
                B[key] = 0;
              }
              else if (key == "Correct" || key == "Coherent") {
                if (last.check == 1 ) {
                  B[key] = 3;
                }
                else if (last.check == 2) {
                  B[key] = 0;
                }
                else {
                  B[key] = 1;
                }
              }
            });

            console.log(B);
            
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];

              // 기존 배열의 해당 인덱스의 labels를 업데이트
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                labels: B
              };
    
              return updatedMessages;
            });
          }
        }
      };

      fetchData();
    }, [messages]);

    const content = (
      <div ref={containerRef} className="history_chat_messages">
              {messages && messages.map((message, index) => (
                <div className="history_chat_messages_inner">
                  
                    {
                      message.speaker==="chatbot"?
                      <div className="history_chat_messages_inner2">
                        <div key={index} className={`history_message_${message.speaker} history_message`}>
                          {message.sentence}
                        </div>
                        <div className={`message_time message_time_${message.speaker}`}>{convertTimestampToTime(message.timestamp)}</div>
                      </div>
                      :
                      (message.speaker==="system"?
                      <div className="history_chat_messages_inner2">
                        <div key={index} className={`history_message_${message.speaker} history_message`}>
                          {message.sentence}
                        </div>
                      </div>
                      :
                      <div className="history_chat_messages_inner2">
                        <div className={`message_time message_time_${message.speaker}`}>{convertTimestampToTime(message.timestamp)}</div>
                        <div key={index} className={`history_message_${message.speaker}_${message.check} history_message`}>
                          {message.sentence}
                        </div>
                        
                      </div>)
                    }
                    
                  
                  
                  <div className="sevenC_wrapper" >
                    <div className="sevenC_wrapper_inner">
                      {message && message.labels && Object.entries(message.labels).map(([key, value]) =>
                        <div className={`sevenC${value} sevenC_inner`} style={{width: `${value!==0? key.length * 0.6 : 0}em`}}>{value!==0?`${key}`:null}</div>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
    )

    useEffect(() => {
        // 컴포넌트가 업데이트될 때마다 스크롤을 아래로 이동
        // const container = containerRef.current;
        // container.scrollTop = container.scrollHeight;

        const container = containerRef.current;

        // .A 클래스를 가진 하위 엘리먼트를 찾아 스크롤을 아래로 이동
        if (container) {
            // console.log("container selected");
            const lastMessage = container.lastElementChild;
            if (lastMessage) {
                // console.log("last element selected");
                lastMessage.scrollIntoView({
                    behavior: "auto",
                    block: "end",
                    inline: "nearest",
                });
            }
        }

        // console.log("content changed");
    }, [content]);

    return (
      <div className="communication_container">
        <div className="communicaiton_chatbot_container">
          <div className="communicaiton_chatbot_contents">
            <div className="communicaiton_chatbot_contents_inner">
              <div className="communicaiton_title">
                  <div className="communicaiton_title_inner">{answer.title}</div>
              </div>
              <hr />
              {content}
            </div>

            
          </div>
          <div className="chat-input-guideline">
            {(answer && Object.keys(answer).length !== 0 && sentenceOrder < answer.conversation.length &&  answer.conversation[sentenceOrder].speaker === "user") ? answer.conversation[sentenceOrder].guide_user.join(', ') : (sentenceOrder >= MAXCONVERSATION ? "학습을 완료하였습니다." : "응답을 생성중입니다.")}
            {/* {console.log(sentenceOrder, MAXCONVERSATION)} */}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="질문을 입력하세요"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button className="chat-submit" onClick={handleSubmit} disabled={isButtonDisabled}>
              Send
            </button>
          </div>
        </div>
        <div className="communication_situation">
          {answer? answer.situation : ""}
        </div>
      </div>

    );
};

export default CommunicationChatbot;
