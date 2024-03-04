import { createContext, useState, useEffect } from "react";
// import jwt_decode from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(); // Context 생성

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // localStorage에 authTokens이 있을 경우 가져와서 authTokens에 넣는다.
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
    );

    // localStorage에 authTokens이 있을 경우 jwt_decode로 authTokens를 decode해서 user 정보에 넣는다.
    const [user, setUser] = useState(() =>
        localStorage.getItem("authTokens")
            ? jwtDecode(localStorage.getItem("authTokens"))
            : null
    );

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); // react router dom 6버전 이상부터는 useHistory대신 useNavigate 사용

    const loginUser = async (id, password) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                password,
            }),
        });
        const data = await response.json();

        // 로그인에 성공했을 경우 홈으로 이동
        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));
            navigate("/");
        } else {
            alert("아이디 혹은 비밀번호가 일치하지 않습니다.");
        }
    };

    const registerUser = async (
        name,
        password,
        password2,
        email,
        dept,
        phone,
        id
    ) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                password,
                password2,
                email,
                dept,
                phone,
                id,
            }),
        });
        if (response.status === 201) {
            navigate("/login");
        } else if (response.status === 400) {
            // 이메일 중복 에러인 경우
            return response.json().then((data) => {
                alert("이미 등록된 이메일입니다.");
                window.location.reload();
            });
        } else {
            alert("회원가입 실패");
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        navigate("/");
    };

    const changePassword = async (oldPassword, newPassword, newPassword2) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/password_change/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                        confirm_new_password: newPassword2,
                    }),
                }
            );

            if (response.status === 200) {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                navigate("../profile");
            } else if (response.status === 400) {
                const data = await response.json();
                alert(`비밀번호 변경 실패: ${data.detail}`);
            } else {
                alert("비밀번호가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error("비밀번호 변경 중 오류:", error);
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/password_reset/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            if (response.status === 200) {
                alert(
                    "이메일이 성공적으로 전송되었습니다. 이메일을 확인하세요."
                );
            } else if (response.status === 404) {
                alert("존재하지 않는 사용자입니다.");
            } else {
                alert("비밀번호 재설정 요청에 실패했습니다.");
            }
        } catch (error) {
            console.error("비밀번호 재설정 요청 중 오류:", error);
        }
    };

    const contextData = {
        user,
        setUser,
        authTokens,
        setAuthTokens,
        registerUser,
        loginUser,
        logoutUser,
        changePassword,
        requestPasswordReset,
    };

    useEffect(() => {
        if (authTokens) {
            setUser(jwtDecode(authTokens.access));
        }
        setLoading(false);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
