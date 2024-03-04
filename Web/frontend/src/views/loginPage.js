import { useContext } from "react"; // 리액트에서 useContext 모듈을 가져옵니다.
import AuthContext from "../context/AuthContext"; // 커스텀 인증 컨텍스트를 가져옵니다.
import "./loginPage.css"

const LoginPage = () => {
  const { loginUser } = useContext(AuthContext); // AuthContext에서 loginUser 함수를 가져옵니다.

  const handleSubmit = e => {
    e.preventDefault(); // 폼 제출 기본 동작을 막습니다. 페이지 리로드를 방지합니다.

    // 폼에서 아이디(id)과 비밀번호(password)를 가져옵니다.
    const id = e.target.id.value;
    const password = e.target.password.value;

    // 아이디가 비어 있지 않은 경우에만 loginUser 함수를 호출하여 로그인을 시도합니다.
    id.length > 0 && loginUser(id, password);
  };

  return (
    <section>
      <div className="regloginSection">
        <div id="loginFormDiv">
          <form onSubmit={handleSubmit} className="loginForm">
            <div className="loginTitle">로그인</div>
            <div className="loginContent">
              <input type="text" id="loginId" name="id" placeholder="아이디" />
            </div>
            <div className="loginContent">
              <input type="password" id="password" name="password" placeholder="비밀번호" />
            </div>
            <button type="submit" id="loginBtn">로그인</button> {/* 폼 제출을 위한 로그인 버튼 */}
          </form>
        </div>
        {/* <div>
          <Link to="/findId">
            아이디 찾기
          </Link>
          <Link to="/findPw">
            비밀번호 찾기
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default LoginPage;
