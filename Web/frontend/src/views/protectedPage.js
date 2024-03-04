import { useEffect, useState } from "react"; // 리액트에서 useEffect와 useState 모듈을 가져옵니다.
import useAxios from "../utils/useAxios"; // useAxios 커스텀 훅을 가져옵니다.

function ProtectedPage() {
  const [res, setRes] = useState(""); // 상태 변수 res를 초기화하고 설정 함수 setRes를 가져옵니다.
  const api = useAxios(); // useAxios 커스텀 훅을 사용하여 Axios 인스턴스를 생성합니다.

  useEffect(() => {
    // useEffect를 사용하여 컴포넌트가 마운트될 때 데이터를 가져옵니다.

    const fetchData = async () => {
      try {
        // API를 호출하여 데이터를 가져옵니다.
        const response = await api.get("/test/");

        // 가져온 데이터의 응답을 상태 변수 res에 설정합니다.
        setRes(response.data.response);
      } catch {
        // 에러가 발생한 경우 "Something went wrong" 메시지를 상태 변수 res에 설정합니다.
        setRes("Something went wrong");
      }
    };

    fetchData(); // fetchData 함수를 호출하여 데이터를 가져옵니다.

  }, []); // 빈 배열을 두 번째 매개변수로 전달하여 이펙트가 한 번만 실행되도록 설정합니다.

  return (
    <div>
      <h1>Projected Page</h1> {/* 보호된 페이지의 제목 */}
      <p>{res}</p> {/* 상태 변수 res에 저장된 응답을 표시합니다. */}
    </div>
  );
}

export default ProtectedPage;
