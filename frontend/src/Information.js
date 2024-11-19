import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 페이지 이동과 데이터 전달 훅
import './Information.css'; // 스타일 파일

const Information = () => {
  const location = useLocation(); // 전달받은 데이터 접근
  const navigate = useNavigate();

  // 더미 데이터 (나중에 DB에서 불러올 예정)
  const pillData = [
    {
      name: '감기약',
      completionDate: '2024.10.11 오전',
      instructions: '물과 함께 한번에 한포씩',
      memo: '듀파락, 에도스캡슐, 애니코프캡슐',
      remaining: 4,
      percentage: 60,
    },
    {
      name: '진통제',
      completionDate: '2024.11.20 오후',
      instructions: '식후 30분 후 복용',
      memo: '타이레놀, 애드빌',
      remaining: 3,
      percentage: 75,
    },
  ];

  // 전달받은 index로 데이터 선택
  const pillIndex = location.state?.pillIndex || 0; // 기본값 0
  const pill = pillData[pillIndex];

  return (
    <div className="information-page">
      {/* Header */}
      <header className="information-header">
        <button className="icon-button" onClick={() => navigate(-1)}>
            &lt; Back
        </button>
        <h1 className="logo">약 세부사항</h1>
    </header>


      {/* Content */}
      <main className="content">
        <div className="pill-image-placeholder">
          <div className="pill-image"></div>
        </div>
        <h2>{pill.name}</h2>
        <p><strong>예상 복용 완료일:</strong> {pill.completionDate}</p>
        <p><strong>복용 방법:</strong> {pill.instructions}</p>
        <p><strong>메모:</strong> {pill.memo}</p>
        <p><strong>남은 횟수:</strong> {pill.remaining}번, {pill.percentage}% 복용했어요!</p>
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress" style={{ width: `${pill.percentage}%` }}></div>
        </div>

        <button className="complete-button" disabled>복용완료하기</button>
      </main>
    </div>
  );
};

export default Information;
