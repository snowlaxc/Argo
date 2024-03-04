// 중복검사 공백도 들어감
// 아이디 특수문자 사용가능?

import React, { useState, useContext, useCallback } from "react"; // 리액트 및 필요한 모듈 가져오기
import AuthContext from "../context/AuthContext"; // 인증 컨텍스트 가져오기
import "./registerPage.css";
import LoginModal from "../components/LoginModal";

function Register() {
    // 사용자 입력값을 상태 변수로 관리
    const [name, setName] = useState(""); // 사용자 이름 상태
    const [password, setPassword] = useState(""); // 비밀번호 상태
    const [password2, setPassword2] = useState(""); // 비밀번호 확인 상태
    const [email, setEmail] = useState(""); // 이메일 상태
    const [dept, setDept] = useState(""); // 부서 선택 상태
    const [phone, setPhone] = useState("");
    const [id, setId] = useState("");
    const { registerUser } = useContext(AuthContext); // 사용자 등록 함수

    // 확인
    const [confirmPwdMsg, setConfirmPwdMsg] = useState(""); //비번 확인
    const [idIsCuplicate, setIdIsDuplicate] = useState(false); //아이디 중복인지(True,False)
    const [emailIsDuplicate, setEmailIsDuplicate] = useState(false); // 이메일 중복여부(True,False)

  // 메시지
  const [pwdMsg, setPwdMsg] = useState(''); // 비밀번호 유효성 메시지
  const [emailMsg, setEmailMsg] = useState(""); // 이메일 유효성 메시지
  const [idMsg, setIdMsg] = useState("") // 아이디 중복 메세지
  const [phongMsg, setPhoneMsg] = useState("") //폰번호 유효성 메세지

    // warning 색
    const [idMsgColor, setIdMsgColor] = useState("red"); // 초기값을 빨강으로 설정
    const [emailMsgColor, setEmailMsgColor] = useState("red");

    // 이메일 인증 관련
    const [backCode, setBackCode] = useState("");
    const [code, setCode] = useState("");
    const [codeDisplay, setCodeDisplay] = useState("none");
    const [isMailChecked, setMailChecked] = useState(false);

    //약관 동의
    const [isModalOpen, setModalOpen] = useState(false);
    const [isTermsChecked, setTermsChecked] = useState(false);

    const handleCheckboxChange = () => {
        if (isTermsChecked) {
            setTermsChecked(false);
        } else {
            setModalOpen(true);
        }
    };
    const handleModalOpen = () => {
        setModalOpen(true);
    };
    const handleModalClose = () => {
        setModalOpen(false);
        setTermsChecked(true);
    };

    //비밀번호 확인
    const onChangeConfirmPwd = useCallback(
        (e) => {
            const currConfirmPwd = e.target.value;
            setPassword2(currConfirmPwd);

            if (currConfirmPwd !== password) {
                setConfirmPwdMsg("비밀번호가 일치하지 않습니다.");
            } else {
                setConfirmPwdMsg("비밀번호가 일치합니다.");
            }
        },
        [password]
    );

    // 비밀번호 변경 핸들러
    const onChangePwd = useCallback((e) => {
        // 입력한 비밀번호 값을 가져옵니다.
        const currPwd = e.target.value;

        // 상태 변수 password를 업데이트하여 현재 비밀번호와 동기화합니다.
        setPassword(currPwd);

        // 입력된 비밀번호의 유효성을 검사하고, 메시지를 설정합니다.
        if (!validatePwd(currPwd)) {
            setPwdMsg(
                "영문, 숫자, 특수기호( !@#$%^*_+=- ) 조합으로 8자리 이상 입력해주세요."
            );
        } else {
            setPwdMsg("안전한 비밀번호입니다.");
        }
    }, []);

    // 이메일 변경 핸들러
    const onChangeEmail = useCallback(async (e) => {
        setEmailIsDuplicate(false);
        setCodeDisplay("none");
        setCode("");
        setBackCode("");
        setMailChecked(false);
        // 입력한 이메일 값을 가져옵니다.
        const currEmail = e.target.value;

        // 상태 변수 email을 업데이트하여 현재 이메일과 동기화합니다.
        setEmail(currEmail);

    // 입력된 이메일의 유효성을 검사하고, 메시지를 설정합니다.
    if (!validateEmail(currEmail)) {
      setEmailMsg("이메일 형식이 올바르지 않습니다.");
      setEmailMsgColor("red")
    } else {
      setEmailMsg("올바른 이메일 형식입니다.");
      setEmailMsgColor('green')
    }
  }, []);

  // 폰번호 변경 핸들러
  const onChangePhone = (currphone) => {
    setPhone(currphone)

    if (!validatePhone(currphone)) {
      setPhoneMsg("번호 형식이 올바르지 않습니다.");
    } else {
      setPhoneMsg("올바른 형식입니다.");
      // setPhoneMsg("")
    }
  }

    // 비밀번호 유효성 검사 함수
    const validatePwd = (password) => {
        return password
            .toLowerCase()
            .match(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*_+=-])(?=.*[0-9]).{8,15}$/);
    };

  // 이메일 유효성 검사 함수
  const validateEmail = (email) => {
    return email
      .toLowerCase()
      .match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?$/);
  };

  // 전화번호 유효성 검사 함수
  const validatePhone = (phone) => {
    return phone
      .toLowerCase()
      .match(/^([0-9]{11})$/);
  };

    // 아이디 중복체크
    const checkDuplicateId = useCallback(async () => {
        try {
            // 아이디 값이 비어있으면 중복 확인하지 않음
            if (!id) {
                setIdMsg("아이디를 입력해주세요.");
                setIdMsgColor("red");
                return;
            }

            // 백엔드 API 호출하여 아이디 중복 여부 확인
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/checkId/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                if (data.isDuplicate) {
                    setIdMsg("이미 사용 중인 아이디입니다.");
                    setIdMsgColor("red");
                } else {
                    setIdMsg("사용 가능한 아이디입니다.");
                    setIdIsDuplicate(true);
                    setIdMsgColor("green");
                }
            } else {
                console.error("Failed to check duplicate id.");
            }
        } catch (error) {
            console.error("Error occurred while checking duplicate id:", error);
        }
    }, [id]);

    // 이메일 중복체크
    const checkDuplicateEmail = useCallback(async () => {
        try {
            // 이메일 값이 비어있으면 중복 확인하지 않음
            if (!email) {
                setEmailMsg("이메일을 입력해주세요.");
                setEmailMsgColor("red");
                return;
            }

            // 백엔드 API 호출하여 이메일 중복 여부 확인
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/checkEmail/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                if (data.isDuplicate) {
                    setEmailMsg("이미 사용 중인 이메일입니다.");
                    setEmailMsgColor("red");
                } else {
                    setEmailMsg("사용 가능한 이메일입니다.");
                    setEmailMsgColor("green");
                    setCodeDisplay("");
                }
            } else {
                console.error("Failed to check duplicate id.");
            }
        } catch (error) {
            console.error("Error occurred while checking duplicate id:", error);
        }
    }, [email]);

    /**
     * 이메일을 보낸 후 인증 검사 과정.
     * TODO: 승연이가 여기 주석 예쁘게 써줘~ 부탁해!
     */
    const mailSend = useCallback(async () => {
        setMailChecked(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/mailSend/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        });
        const data = await response.json();
        // console.log(data);
        setBackCode(data.code);
    }, [email]);

    const validateCode = (code) => {
        return code === backCode;
    };

    // 인증번호 검사
    const checkCode = (e) => {
        if (code === backCode) {
            setEmailMsg("인증되었습니다.");
            setEmailMsgColor("green");
            setCodeDisplay("none");
            setEmailIsDuplicate(true);
        } else {
            setEmailMsg("잘못된 인증번호입니다.");
            setEmailMsgColor("red");
        }
    };

    // 부서 선택했는지
    const validateDept = (dept) => {
        return dept !== "";
    };

    const idChange = (e) => {
        const newId = e.target.value;
        setId(newId);
        setIdMsg("");
        setIdIsDuplicate(false);

        // 아이디 길이 검증 추가
        if (newId.length < 4) {
            setIdMsg("아이디는 최소 4자 이상이어야 합니다.");
            setIdMsgColor("red");
        }
    };

  // 검사 함수로 정리
  // const isEmailValid = validateEmail(email); 
  const isPwdValid = validatePwd(password);
  const isCodeValid = validateCode(code);
  const isConfirmPwd = password === password2;
  const isDeptValid = validateDept(dept);
  // const isDuId = checkDuplicateId(id);
  // const isDuEmail = checkDuplicateEmail(email);
  const isPhoneValid = validatePhone(phone)

  // 검사를 묶기
  const isAllValid = idIsCuplicate && emailIsDuplicate && isPwdValid && isConfirmPwd && isCodeValid && isDeptValid && isTermsChecked && isPhoneValid;

    // 회원가입 양식 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 회원가입 함수 호출
        registerUser(name, password, password2, email, dept, phone, id);
    };

    return (
        <section
            style={{
                height: "auto",
                minHeight: "calc(100% - 5em)",
                display: "flex",
            }}
        >
            <div className="regloginSection">
                <div id="regFormDiv">
                    <form onSubmit={handleSubmit} className="registForm">
                        <div className="regTitle">회원가입</div>
                        <div className="regContent">
                            <input
                                type="text"
                                id="name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름"
                                required
                            />
                        </div>
                        <div className="regContent">
                            <input
                                type="text"
                                id="id"
                                onChange={idChange}
                                placeholder="아이디"
                                required
                                // disabled={idIsCuplicate}
                            />
                            <button type="button" onClick={checkDuplicateId}>
                                중복 확인
                            </button>
                            <p style={{ color: idMsgColor }}>{idMsg}</p>
                        </div>
                        <div className="regContent">
                            <input
                                type="password"
                                id="password"
                                onChange={onChangePwd}
                                placeholder="비밀번호"
                                required
                            />
                            <p
                                style={{
                                    color: validatePwd(password)
                                        ? "green"
                                        : "red",
                                }}
                            >
                                {pwdMsg}
                            </p>{" "}
                            {/* 비밀번호 유효성 메시지 */}
                        </div>
                        <div className="regContent">
                            <input
                                type="password"
                                id="confirm-password"
                                onChange={onChangeConfirmPwd}
                                placeholder="비밀번호 확인"
                                required
                            />
                            <p
                                style={{
                                    color:
                                        password2 === password
                                            ? "green"
                                            : "red",
                                }}
                            >
                                {confirmPwdMsg}
                            </p>{" "}
                            {/* 비밀번호 일치 여부 메시지 */}
                        </div>
                        <div className="regContent">
                            <input
                                type="text"
                                id="email"
                                onChange={onChangeEmail}
                                placeholder="이메일"
                                // disabled={emailIsDuplicate}
                                required
                            />
                            <button type="button" onClick={checkDuplicateEmail}>
                                중복 확인
                            </button>
                            <p style={{ color: emailMsgColor }}>{emailMsg}</p>

              <div style={{ display: codeDisplay }} id="emailCheckDiv">
                <input
                  type="text"
                  id="code"
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code"
                  value={code}
                  required
                />
                {isMailChecked ? <button onClick={checkCode} type="button">확인</button> : <button onClick={mailSend} type="button">인증번호 보내기</button>}
              </div>
            </div>
            <div className="regContent">
              <input
                type="text"
                id="phone"
                onChange={(e) => onChangePhone(e.target.value)}
                placeholder="폰 번호  ex) 01012345678"
                required
              />
              <p style={{ color: validatePhone(phone) ? 'green' : 'red' }}>{phongMsg}</p>
            </div>
            <div className="regContent">
              <select name="dept" id="dept" onChange={(e) => setDept(e.target.value)} value={dept}>
                <option value="">부서 선택</option>
                <option value="1">개발</option>
                <option value="2">인사</option>
                <option value="3">기획</option>
              </select>
            </div>
            <div id="terms">
              <label id="terms_label">
                <input type="checkbox" checked={isTermsChecked} onChange={handleCheckboxChange} />
                (필수) 개인정보 수집 및 이용
              </label>
              <button onClick={handleModalOpen} type="button">약관 보기</button>
              <LoginModal isOpen={isModalOpen} onClose={handleModalClose}>
                <br></br>개인정보처리방침
                <br></br>여러분의 성공을 위한 파트너, ARGO

                <h3>제1조 총칙</h3>
                <br></br>ARGO(이하 "회사")는 고객님의 개인정보를 소중하게 생각하고 고객님의 개인정보를 효과적으로 관리하고 안전하게 보호하기 위하여 최선의 노력을 다 하고 있습니다. 회사는 『개인정보 보호법』과 개인정보보호 관련 각종 법규를 준수하고 있습니다. 또한 개인정보처리방침을 제정하여 이를 준수하고 있으며, 본 처리방침을 홈페이지(https://www.argo12.duckdns.org)에 공개하여 고객님께서 언제나 쉽게 열람하실 수 있도록 하고 있습니다.<br></br>

                <br></br>개인정보란 생존하는 개인에 관한 정보로서 다음의 정보를 포함합니다.
                <br></br>가. 성명, 주민등록번호 및 영상 등을 통하여 개인을 알아볼 수 있는 정보

                <br></br>나. 해당 정보만으로는 특정 개인을 알아볼 수 없어도 다른 정보와 쉽게 결합하여 알아볼 수 있는 정보

                <br></br>다. 위 정보를 가명처리함으로써 원래의 상태로 복원하기 위한 추가정보의 사용 없이는 개인을 알아볼 수 없는 정보(이하 '가명정보')

                <br></br>회사는 고객님의 개인정보를 중요시하며, 「개인정보 보호법」과 개인정보 보호 관련 각종 법규를 준수하고 있습니다.
                <br></br>회사는 개인정보처리방침을 통하여 고객님의 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
                <br></br>회사의 개인정보처리방침은 관련 법령 및 내부 운영 방침의 변경에 따라 개정될 수 있습니다. 개인정보처리방침이 개정되는 경우에는 시행일자 등을 부여하여 개정된 내용을 홈페이지(https://www.argo12.duckdns.org)에 지체 없이 공지합니다.
                <br></br>영업의 전부 또는 일부를 양도하거나 합병 등으로 개인정보를 이전하는 경우 서면 전자우편 등을 통하여 고객님께 개별적으로 통지하고, 회사의 과실 없이 고객님의 연락처를 알 수 없는 경우에 해당하여 서면, 전자우편 등으로 통지할 수 없는 경우에는 홈페이지(https://www.argo12.duckdns.org), 첫 화면에서 식별할 수 있도록 표기하여 30일 이상 그 사실을 공지합니다. 단, 천재지변 등 정당한 사유로 홈페이지 게시가 곤란한 경우에는 2곳 이상의 중앙일간지(정보주체의 대부분이 특정 지역에 거주하는 경우에는 그 지역을 보급구역으로 하는 일간지로 할 수 있습니다.)에 1회 이상 공고하는 것으로 갈음합니다.
                <br></br>제2조 개인정보의 수집∙이용 목적, 항목 및 보유 기간
                <br></br>                회사는 필요한 범위에서 최소한의 개인정보만을 수집합니다.
                <br></br>사상, 신념, 가족 및 친인척관계, 학력(學歷)·병력(病歷), 기타 사회활동 경력 등 고객님의 권리  이익이나 사생활을 뚜렷하게 침해할 우려가 있는 개인정보는 수집하지 않습니다. 다만, 고객님께서 수집에 동의하시거나 다른 법률에 따라 특별히 수집 대상 개인정보로 허용된 경우에는 필요한 범위에서 최소한으로 위 개인정보를 수집할 수 있습니다.
                <br></br>법령에 따라 수집 목적과 합리적으로 관련된 범위에서는 고객님의 동의없이 개인정보를 이용할 수 있으며, 이 때 '당초 수집 목적과 관련성이 있는지, 수집한 정황 또는 처리 관행에 비추어 볼 때 예측 가능성이 있는지, 고객님의 이익을 부당하게 침해하는 지, 가명처리 또는 암호화 등 안전성 확보에 필요한 조치를 하였는지'를 종합적으로 고려합니다.
                <br></br>수집한 개인정보를 특정 개인을 알아볼 수 없도록 가명처리하여 통계작성, 과학적 연구, 공익적 기록보존 등의 목적으로 고객님의 동의 없이 처리할 수 있습니다. 이 때 가명정보는 재식별되지 않도록 추가정보와 분리하여 별도 저장/관리하고 필요한 기술적·관리적 보호조치를 취합니다.
                <br></br>회사가 수집하는 개인정보 항목과 수집∙이용하는 목적은 다음과 같습니다.

                <br></br>가. 필수 수집∙이용 목적 및 항목

                <br></br>수집∙이용 목적	개인정보 항목	보유기간
                <br></br>교육 운영   성명(한글), 연락처(휴대전화), 이메일, ID    퇴사 후 12개월 까지
                
                <br></br>나. 선택 수집∙이용 목적 및 항목

                <br></br>없음
                <br></br>※보유기간 예외: 법령에 특별한 규정이 있을 경우 관련 법령에 따라 보관

                <br></br>※위 정보는 가입 당시 정보뿐만 아니라 정보 수정으로 변경된 정보를 포함합니다.

                <br></br>※주민등록번호 처리 근거: 「근로자직업능력 개발법 시행령」 제52조의2(민감정보 및 고유식별정보의 처리) 제1항 제1의 2호 · 제1의 3호 · 제2호 · 제3호 · 제4호 · 제12호

                <br></br>제3조 개인정보의 수집방법
                <br></br>회사는 다음과 같은 방법으로 개인정보를 수집합니다.

                <br></br>가. 홈페이지(https://www.argo12.duckdns.org)에서 회원가입 신청서 작성을 통해 수집

                <br></br>제4조 개인정보의 보유 및 이용기간
                <br></br>회사는 고객님의 개인정보를 아래 기간 동안에 한하여 보유하고 이를 이용합니다.
                <br></br>가. 신입사원 교육과정 종료 시까지

                <br></br>나. 법령에서 특별한 기간을 규정하여 보관하는 경우

                <br></br>※예시: 상법'에 따른 상업장부와 영업에 관한 중요서류에 포함된 개인정보(10년), '통신비밀보호법'에 따른 통신사실확인자료 제공 관련(12개월 또는 3개월), '전자상거래등에서의 소비자보호에 관한 법률'에 따른 표시/광고에 관한 기록(6개월), 계약 또는 청약철회 등에 관한 기록, 대금결제 및 재화 등의 공급에 관한 기록(5년), 소비자의불만 또는 분쟁처리에 관한 기록(3년), '신용정보의 이용 및 보호에 관한 법률'에 따른 신용정보의 수집/처리 및 이용 등에 관한 기록(3년) 등이 해당됩니다.

                <br></br>제5조 개인정보의 파기절차 및 방법
                <br></br>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.


                <br></br>파기절차
                <br></br>가. 고객님의 개인정보는 수집 및 이용목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유(보유 및 이용기간 참조)에 따라 일정 기간 저장된 후 파기됩니다.

                <br></br>나. 별도 DB로 옮겨진 개인정보는 법률에 의한 경우와 재가입시 가입비 면제 대상여부를 확인하는 경우가 아니고서는 보유되는 이외의 다른 목적으로 이용되지 않습니다.

                <br></br>파기방법
                <br></br>가. 종이(서면)에 작성·출력된 개인정보 : 분쇄하거나 소각 등의 방법으로 파기

                <br></br>나. DB 등 전자적 파일 형태로 저장된 개인정보 : 재생할 수 없는 기술적 방법으로 삭제

                <br></br>제6조 수집한 개인정보의 공유 및 제공
                <br></br>회사는 고객님의 사전 동의 없이 고객님의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다.
                <br></br>가. 관련 법령(통신비밀보호법, 전기통신사업법, 국세기본법 등)에 특별한 규정이 있는 경우로서, 법령에 정해진 규정과 절차에 따라 제공하는 경우

                <br></br>제 7 조 개인정보 처리의 위탁
                <br></br>회사는 교육과정 운영을 위한 고객님의 편의 증진 등을 위하여 개인정보 처리업무를 외부 전문업체에게 위탁하고 있으며, 수탁자에 대해서는 “위∙수탁계약서” 등을 통하여 관련 법규 및 지침의 준수, 정보보호 및 비밀유지, 제3자 제공 금지, 사고 시 책임부담, 위탁기간 종료 즉시 개인정보의 반납/파기 의무 등 책임에 관한 사항을 규정하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.

                <br></br>제8조 이용자 및 법정대리인의 권리와 그 행사 방법
                <br></br>고객님께서는 언제든지 개인정보, 개인정보를 이용하거나 제3자에게 제공한 현황, 개인정보 수집∙이용∙제공 등의 동의를 한 현황(이하 ‘개인정보 등’이라 합니다)에 대한 열람이나 제공을 요구하실 수 있고, 오류가 있는 경우에는 그 정정을 요구하실 수 있으며, 개인정보의 수집∙이용∙제공에 대한 동의를 철회를 하실 수 있습니다.
                <br></br>고객님의 개인정보 등에 대한 열람 및 정정, 등록해지(동의철회)를 위해서는 고객님이 지정담당자나 고객센터에 요청하여 직접 열람 및 정정(선택적 동의철회 포함), 등록해지(동의철회)를 하실 수 있습니다.
                <br></br>고객님께서 본인의 개인정보 등에 대한 열람이나 정정을 요구하시거나 개인정보 수집∙이용∙제공 등의 동의를 철회하시는 경우 고객님의 신분을 증명할 수 있는 주민등록증, 여권, 운전면허증(신형) 등의 신분증명(사본)을 제시 받아 본인 여부를 확인합니다.
                <br></br>고객님의 대리인이 고객님의 개인정보 등에 대한 열람이나 정정을 요구하거나 고객님의 개인정보의 수집∙이용∙제공에 대한 동의를 철회하는 경우에는 대리 관계를 나타내는 위임장, 명의고객님의 인감증명서와 대리인의 신분증명서 등의 증표를 제시 받아 적법한 대리인인지 여부를 확인합니다.
                <br></br>고객님께서는 개인정보 등의 열람이나 제공을 요청하실 수 있으며, 회사는 이러한 요청에 지체 없이 필요한 조치를 취합니다.
                <br></br>고객님께서 개인정보 등의 오류에 대한 정정을 요청하신 경우에는 지체 없이 그 오류를 정정하거나 정정하지 못하는 사유를 이용자에게 알리는 등 필요한 조치를 하고, 필요한 조치를 할 때까지는 당해 개인정보를 이용 또는 제공하지 않습니다. 또한 잘못된 개인정보를 제3자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 지체 없이 통지하여 정정이 이루어지도록 하겠습니다. 다만, 다른 법률에 따라 개인정보의 제공을 요청 받은 경우에는 그 개인정보를 제공하거나 이용할 수 있습니다.
                <br></br>회사는 고객님의 요청에 의해 해지 또는 삭제된 개인정보를 “개인정보의 보유 및 이용기간”에 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.
                <br></br>제9조 개인정보 자동 수집장치의 설치 운영 및 그 거부에 관한 사항
                <br></br>회사는 홈페이지 운영에 있어 필요 시 고객님의 정보를 찾아내고 저장하는 '쿠키(Cookie)'를 운용합니다. 쿠키는 회사의 웹사이트를 운영하는데 이용되는 서버가 고객님의 브라우저에 보내는 아주 작은 텍스트 파일로서 고객님의 컴퓨터 하드디스크에 저장됩니다. 고객님께서는 웹브라우저의 보안 정책을 통해 쿠키에 의한 정보수집의 허용 거부 여부를 결정하실 수 있습니다.

                <br></br>쿠키에 의해 수집되는 정보 및 이용 목적
                <br></br>가. 수집 정보 : ID, 접속IP, 접속로그, 이용 컨텐츠 등 서비스 이용정보

                <br></br>나. 이용목적

                <br></br>ㅇ 고객님의 관심분야에 따라 차별화된 정보를 제공

                <br></br>ㅇ 회원과 비회원의 접속 빈도나 방문 시간 등을 분석하여 이용자의 취향과 관심분야를 파악하여 타켓(Target) 마케팅에 활용(쇼핑한 품목들에 대한 정보와 관심 있게 둘러본 품목들에 대한 자취를 추적하여 다음 번 쇼핑 때 개인 맞춤 서비스를 제공, 유료서비스 이용 시 이용기간 안내, 고객님들의 습관을 분석 등) 및 서비스 개편 등의 척도로 활용

                <br></br>고객님은 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 웹브라우저에서 옵션을 설정함으로써 쿠키에 의한 정보 수집 수준의 선택을 조정하실 수 있습니다.
                <br></br>가. 웹브라우저의 [도구]메뉴 - [인터넷옵션] - [개인정보]에서 쿠키에 의한 정보 수집 수준을 정할 수 있습니다.

                <br></br>나. 위에 제시된 메뉴를 통해 쿠키가 저장될 때마다 확인을 하거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다. 단, 고객님께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.

                <br></br>제10조 개인정보의 기술적, 관리적 보호
                <br></br>회사는 고객님의 개인정보가 분실, 도난, 유출, 위조∙변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적∙관리적 대책을 마련하고 있습니다.

                <br></br>[기술적 보호대책]

                <br></br>개인정보는 비밀번호에 의해 보호되며, 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일 잠금기능(Lock)을 사용하는 등 별도 보안기능을 통해 보호되고 있습니다.
                <br></br>백신 소프트웨어를 이용하여 컴퓨터바이러스 등에 의한 피해를 방지하기 위한 조치를 취하고 있습니다. 백신 소프트웨어는 주기적으로 업데이트되며 갑작스런 바이러스가 출현할 경우 백신이 나오는 즉시 이를 도입, 적용함으로써 개인정보가 침해되는 것을 방지하고 있습니다.
                <br></br>네트워크 상의 개인정보 및 개인인증정보를 안전하게 전송할 수 있도록 보안장치(SSL)를 채택하고 있습니다.
                <br></br>해킹 등에 의해 고객님의 개인정보가 유출되는 것을 방지하기 위해, 외부로부터 접근이 통제된 구역에 시스템을 설치하고, 침입을 차단하는 장치를 이용하고 있으며, 아울러 침입탐지시스템을 설치하여 24시간 침입을 감시하고 있습니다.
                <br></br>[관리적 보호대책]

                <br></br>회사는 고객님의 개인정보를 안전하게 처리하기 위한 내부관리계획을 마련하여 임직원이 이를 숙지하고 준수하도록 하고 있으며 준수 여부를 주기적으로 점검하고 있습니다.
                <br></br>회사는 고객님의 개인정보를 처리할 수 있는 자를 최소한으로 제한하고 접근 권한을 관리하며, 새로운 보안 기술 습득 및 개인정보보호 의무 등에 관해 정기적인 사내 교육과 외부 위탁교육을 통하여 법규 및 정책을 준수할 수 있도록 하고 있습니다. 고객님의 개인정보를 처리하는 자는 다음과 같습니다.
                <br></br>가. 고객님을 직·간접적으로 상대하여 마케팅 업무를 수행하는 자

                <br></br>나. 개인정보보호책임자 및 개인정보보호담당자 등 개인정보 관리 및 개인정보보호 업무를 담당하는 자

                <br></br>다. 기타 업무상 개인정보의 처리가 불가피한 자

                <br></br>신규직원 채용 시 그리고 연 1회 전 임직원이 정보보호서약서에 서명하게 함으로써 직원에 의한 정보(개인정보 포함) 유출을 사전에 방지하고, 수시로 개인정보보호 의무를 상기시키며 준수 여부를 감사하기 위한 내부 절차를 마련하여 시행하고 있습니다.
                <br></br>개인정보 취급자의 업무 인수인계는 보안이 유지된 상태에서 철저하게 이뤄지고 있으며, 입사 및 퇴사 후 개인정보 침해사고에 대한 책임을 명확하게 규정하고 있습니다.
                <br></br>회사는 전산실 및 자료보관실 등을 통제구역으로 설정하여 출입을 통제합니다.
                <br></br>서비스 이용계약 체결 또는 서비스 제공을 위하여 고객님의 은행결제계좌, 신용카드번호 등 대금결제에 관한 정보를 수집하거나 고객님께 제공하는 경우 당해 고객님이 본인임을 확인하기 위하여 필요한 조치를 취하고 있습니다.
                <br></br>회사는 고객님 개인의 실수나 기본적인 인터넷의 위험성 때문에 일어나는 일들에 대해 책임을 지지 않습니다. 고객님의 개인정보를 보호하기 위해서 자신의 ID와 비밀번호를 철저히 관리하고 책임을 져야 합니다.
                <br></br>제11조 개인정보 보호책임 부서 및 연락처
                <br></br>회사는 고객님의 개인정보를 보호하고 개인정보와 관련한 불만 및 문의사항을 처리하기 위하여 아래와 같이 관련 부서를 지정하여 운영하고 있습니다. 또한 고객님의 의견을 매우 소중하게 생각합니다. 고객님께서 회사 서비스의 개인정보 관련 문의사항이 있을 경우 아래 개인정보 보호책임자 및 담당자에게 문의하시면 신속하고 성실하게 답변을 드리겠습니다.

                <br></br>제12조 개인정보 열람청구
                <br></br>회사는 고객님의 의견을 매우 소중하게 생각합니다. 고객님께서 문의사항이 있을 경우 회사를 방문하시거나 고객센터 등에 전화로 문의하시면 신속, 정확한 답변을 드리겠습니다.

                <br></br>기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
                <br></br>가. 개인정보 침해신고센터(한국인터넷진흥원 운영)

                <br></br>ㅇ 소관업무 : 개인정보 침해사실 신고, 상담 신청

                <br></br>ㅇ 홈페이지/전화 : http://privacy.kisa.or.kr / (국번없이)118

                <br></br>나. 개인정보 분쟁조정위원회

                <br></br>ㅇ 소관업무 : 개인정보 분쟁조정신청, 집단분쟁조정 (민사적 해결)

                <br></br>ㅇ 홈페이지/전화 : www.kopico.go.kr / (국번없이) 1833-6972

                <br></br>다. 대검찰청 사이버수사과 : www.spo.go.kr / (국번없이) 1301

                <br></br>제13조 권익침해 구제방법
                <br></br>기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하여 주시기 바랍니다.

                <br></br>개인정보 침해신고센터 (한국인터넷진흥원 운영)
                <br></br>가. 소관업무 : 개인정보 침해사실 신고, 상담 신청

                <br></br>나. 홈페이지/전화 : http://privacy.kisa.or.kr / (국번없이) 118

                <br></br>개인정보 분쟁조정위원회
                <br></br>가. 소관업무 : 개인정보 분쟁조정신청, 집단분쟁조정 (민사적 해결)

                <br></br>나. 홈페이지/전화 : www.kopico.go.kr / (국번없이) 1833-6972

                <br></br>대검찰청 사이버수사과 : www.spo.go.kr / (국번없이) 1301
                <br></br>경찰청 사이버안전국 : https://ecrm.police.go.kr / (국번없이) 182
                <br></br>제14조 개인정보처리방침 고지
                <br></br>홈페이지 개인정보처리방침 공고/시행일자
                <br></br>가. 공고일자 : [2024/01/12]

                <br></br>나. 시행일자 : [2024/01/12]
              </LoginModal>
            </div>
            <button id="regBtn" type="submit" disabled={!isAllValid}>회원가입</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;
