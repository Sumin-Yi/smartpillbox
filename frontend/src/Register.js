import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate(); // useNavigate 훅

  // 입력 상태 관리
  const [medicineName, setMedicineName] = useState('');
  const [times, setTimes] = useState({ morning: false, lunch: false, evening: false });
  const [memo, setMemo] = useState('');
  const [dosage, setDosage] = useState('');

  // 홈으로 이동 함수
  const goToHomePage = () => {
    navigate('/'); // 홈 화면으로 이동
  };

  return (
    <div className="register-page">
      {/* Header */}
      <header className="header">
        <button className="header-button" onClick={goToHomePage}>
          취소
        </button>
        <h1 className="header-title">새로운 약</h1>
        <button className="header-button" onClick={goToHomePage}>
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
