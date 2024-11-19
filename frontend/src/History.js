import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅
import './History.css';

const History = () => {
  const navigate = useNavigate();

  // 더미 데이터 (복용 완료된 약 정보)
  const [completedMeds, setCompletedMeds] = useState([
    { id: 1, name: '감기약' },
    { id: 2, name: '진통제' },
    { id: 3, name: '비타민C' },
  ]);

  // 이름 정렬
  const sortedMeds = completedMeds.sort((a, b) => a.name.localeCompare(b.name));

  // 클릭 시 Information 페이지로 이동
  const goToInformationPage = (id) => {
    navigate('/information', { state: { pillId: id } }); // 선택한 약의 ID 전달
  };

  return (
    <div className="history-page">
      {/* Header */}
      <header className="header">
        <button className="icon-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
        <h1 className="logo">복용 기록</h1>
      </header>

      {/* Completed Medication List */}
      <main className="history-content">
        <ul className="history-list">
          {sortedMeds.map((med) => (
            <li
              key={med.id}
              className="history-item"
              onClick={() => goToInformationPage(med.id)} // 클릭 이벤트
            >
              {med.name}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default History;
