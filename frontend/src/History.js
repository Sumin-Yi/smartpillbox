import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅
import { getAuth } from "firebase/auth"; // Firebase Auth
import { ReactComponent as BackIcon } from "./icons/back-filled.svg";

import './History.css';

const History = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [completedMeds, setCompletedMeds] = useState([]); // 복용 완료된 약 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [menuOpen, setMenuOpen] = useState(false); // Menu state


  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const userId = currentUser.email; // 현재 로그인된 사용자의 이메일

        const response = await fetch(`http://localhost:3000/api/history?userId=${userId}`);
        if (!response.ok) {
          throw new Error("복용 기록을 가져오는 데 실패했습니다.");
        }

        const historyData = await response.json();
        setCompletedMeds(historyData); // 상태에 데이터 저장
        setLoading(false); // 로딩 완료
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("복용 기록을 가져오는 중 오류가 발생했습니다.");
        setLoading(false); // 로딩 완료
      }
    };

    fetchHistory();
  }, [auth, navigate]);

  // 클릭 시 InformationHistory 페이지로 이동
  const goToInformationHistoryPage = (id) => {
    navigate('/information-history', { state: { pillId: id } }); // 선택한 약의 ID 전달
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const goToHomePage = () => {
    navigate("/"); // Go to home page
  };

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 이름 정렬
  const sortedMeds = completedMeds.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="history-page">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={goToHomePage}>
          <BackIcon></BackIcon>
        </button>
        <h1 className="logo" onClick={goToHomePage}>
          Smart Pillbox
        </h1>
      </header>

      <h2 className="page-title">복용 기록</h2>

      {/* Completed Medication List */}
      <main className="history-content">
        <ul className="history-list">
          {sortedMeds.map((med) => (
            <li
              key={med.id}
              className="history-item"
              onClick={() => goToInformationHistoryPage(med.id)} // 수정된 함수 호출
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
