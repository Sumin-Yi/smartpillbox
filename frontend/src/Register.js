import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Firebase Auth 가져오기
import "./Register.css";

const Register = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation(); // 전달받은 state 접근
  const pillboxIndex = location.state?.pillboxIndex || 0; // 약통 번호 (기본값 0)

  // 입력 상태 관리
  const [medicineName, setMedicineName] = useState(""); // 약 이름
  const [times, setTimes] = useState({ morning: false, lunch: false, evening: false }); // 복용 시간
  const [memo, setMemo] = useState(""); // 메모
  const [dosage, setDosage] = useState(""); // 총 복용 횟수

  // 홈으로 이동 함수
  const goToHomePage = () => {
    navigate("/"); // 홈 화면으로 이동
  };

  // 서버에 데이터를 전송하는 함수
  const handleSubmit = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("로그인 상태가 아닙니다. 로그인 페이지로 이동합니다.");
      navigate("/login"); // 로그인 페이지로 이동
      return;
    }

    // 서버로 전송할 데이터
    const data = {
      userId: currentUser.email, // 현재 로그인된 사용자의 이메일
      pillboxIndex, // 약통 번호 추가
      medicineName, // 약 이름
      times, // 복용 시간
      dosage, // 총 복용 횟수
      memo, // 메모
      timesTaken: 0, // 복용 횟수를 0으로 초기화
      isConsumed: false, // 복용 여부를 false로 초기화
    };

    try {
      const response = await fetch("http://localhost:3000/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("약 정보를 저장하는 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      console.log(result.message);
      alert("약 정보가 성공적으로 저장되었습니다!");
      navigate("/"); // 저장 성공 후 홈으로 이동
    } catch (error) {
      console.error(error.message);
      alert("약 정보를 저장하지 못했습니다. 다시 시도하세요.");
    }
  };

  return (
    <div className="register-page">
      {/* Header */}
      <header className="header">
        <button className="header-button" onClick={goToHomePage}>
          취소
        </button>
        <h1 className="header-title">새로운 약</h1>
        <button className="header-button" onClick={handleSubmit}>
          완료
        </button>
      </header>

      {/* Form */}
      <main className="form-container">
        {/* Image Upload */}
        <div className="image-upload">
          <div className="image-placeholder">
            <span>사진 추가</span>
          </div>
          <button className="image-upload-button">사진 추가</button>
        </div>

        {/* Medicine Name */}
        <div className="form-group">
          <label>제품명</label>
          <input
            type="text"
            placeholder="제품명을 입력하세요"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />
        </div>

        {/* Time Selection */}
        <div className="form-group">
          <label>복용 시간</label>
          <div className="time-options">
            <label>
              <input
                type="checkbox"
                checked={times.morning}
                onChange={() =>
                  setTimes((prev) => ({ ...prev, morning: !prev.morning }))
                }
              />
              아침
            </label>
            <label>
              <input
                type="checkbox"
                checked={times.lunch}
                onChange={() =>
                  setTimes((prev) => ({ ...prev, lunch: !prev.lunch }))
                }
              />
              점심
            </label>
            <label>
              <input
                type="checkbox"
                checked={times.evening}
                onChange={() =>
                  setTimes((prev) => ({ ...prev, evening: !prev.evening }))
                }
              />
              저녁
            </label>
          </div>
        </div>

        {/* Dosage */}
        <div className="form-group">
          <label>총 횟수</label>
          <input
            type="text"
            placeholder="횟수를 입력하세요"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        {/* Memo */}
        <div className="form-group">
          <label>메모</label>
          <textarea
            placeholder="메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
};

export default Register;
