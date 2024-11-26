import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Firebase Auth 가져오기
import "./Information.css";

const Information = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pill, setPill] = useState(null); // 약 정보 상태
  const pillboxIndex = location.state?.pillboxIndex; // 넘겨받은 pillbox 번호
  const auth = getAuth(); // Firebase Auth 인스턴스

  useEffect(() => {
    const fetchPillData = async () => {
      try {
        const currentUser = auth.currentUser; // 현재 로그인된 사용자 가져오기
        if (!currentUser) {
          alert("로그인이 필요합니다.");
          navigate("/login"); // 로그인 페이지로 이동
          return;
        }

        const userId = currentUser.email; // 현재 사용자의 이메일을 userId로 사용
        console.log("Fetching pill data for user:", userId);

        const response = await fetch(
          `http://localhost:3000/api/medication?userId=${userId}&pillboxIndex=${pillboxIndex}`
        );

        if (!response.ok) {
          throw new Error("약 정보를 가져오는 데 실패했습니다.");
        }

        const data = await response.json();
        setPill(data); // 상태에 데이터 저장
      } catch (error) {
        console.error("Error fetching pill data:", error);
        alert("약 정보를 가져오는 중 오류가 발생했습니다.");
        navigate(-1); // 오류 발생 시 이전 페이지로 이동
      }
    };

    if (pillboxIndex) {
      fetchPillData(); // API 호출
    }
  }, [auth, pillboxIndex, navigate]);

  if (!pill) {
    return <div>Loading...</div>; // 데이터를 불러오는 동안 표시
  }

  return (
    <div className="information-page">
      {/* 약 정보 표시 */}
      <header className="information-header">
        <button className="icon-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
        <h1 className="logo">약 세부사항</h1>
      </header>
      <main className="content">
        <div className="pill-image-placeholder">
          <div className="pill-image"></div>
        </div>
        <h2>{pill.name}</h2>
        <p>
          <strong>예상 복용 완료일:</strong> {pill.createdAt || "알 수 없음"}
        </p>
        <p>
          <strong>복용 방법:</strong> {pill.instructions || "알 수 없음"}
        </p>
        <p>
          <strong>메모:</strong> {pill.note || "알 수 없음"}
        </p>
        <p>
          <strong>총 복용 횟수:</strong> {pill.frequency || "알 수 없음"}번
        </p>
        <p>
          <strong>복용 시간:</strong>{" "}
          {pill.time?.morning && "아침 "}
          {pill.time?.lunch && "점심 "}
          {pill.time?.evening && "저녁 "}
        </p>
        <p>
          <strong>남은 횟수:</strong> {pill.remaining || 0}번
        </p>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${pill.percentage || 0}%` }}
          ></div>
        </div>

        {/* 복용 완료 버튼 */}
        <button className="complete-button" onClick={() => {/* 복용 완료 처리 */}}>
          복용 완료하기
        </button>
      </main>
    </div>
  );
};

export default Information;
