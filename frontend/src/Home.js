import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 페이지 이동 및 상태 관리
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase 인증
import { ReactComponent as PillIcon } from "./icons/pill.svg";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as MenuIcon } from "./icons/menu.svg";
import pillboxIcon from "./icons/pillbox.svg";
import "./Home.css";

const Home = () => {
  const [pills, setPills] = useState([
    { name: "Medicine A", status: "taken" },
    { name: "Medicine B", status: "pending" },
    { name: "Medicine C", status: "missed" },
  ]);

  const [pillboxStatus, setPillboxStatus] = useState([
    "empty", // 1번 약통
    "empty", // 2번 약통
    "empty", // 3번 약통
    "empty", // 4번 약통
  ]);

  const [userId, setUserId] = useState(null); // 로그인된 사용자 ID 상태
  const [menuOpen, setMenuOpen] = useState(false); // 메뉴 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation(); // 다른 페이지에서 전달된 상태 확인

  // Firebase Auth 상태 확인
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.email); // 로그인된 사용자의 이메일 설정
      } else {
        setUserId(null); // 로그아웃된 상태
        navigate("/login"); // 로그인 페이지로 리다이렉트
      }
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
  }, [navigate]);

  // Register 페이지로 약통 번호와 함께 이동
  const goToRegisterPage = (index) => {
    if (pillboxStatus[index] === "empty") {
      navigate("/register", { state: { pillboxIndex: index + 1 } }); // 약통 번호 전달
    } else {
      navigate("/information", { state: { pillboxIndex: index + 1 } }); // 약 정보는 넘기지 않음
    }
  };

  // 약통 상태 업데이트
  const updatePillboxStatus = (index, newStatus) => {
    setPillboxStatus((prevStatus) =>
      prevStatus.map((status, i) => (i === index ? newStatus : status))
    );
  };

  // 약 등록 후 돌아왔을 때 상태 업데이트
  useEffect(() => {
    if (location.state?.updatedPillboxIndex) {
      const updatedIndex = location.state.updatedPillboxIndex - 1; // 0부터 시작하는 인덱스
      updatePillboxStatus(updatedIndex, "red"); // 약 등록된 약통 상태를 'red'로 변경
    }
  }, [location.state]);

  // 초기 약통 상태를 Firestore에서 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return; // 로그인되지 않은 상태에서는 데이터를 가져오지 않음

      try {
        const response = await fetch(`http://localhost:3000/api/medications?userId=${userId}`);
        const medications = await response.json();

        // Firestore 데이터를 기반으로 약통 상태 업데이트
        const updatedStatus = pillboxStatus.map((status, index) => {
          const pillboxIndex = index + 1; // 약통 번호 (1부터 시작)
          const isOccupied = medications.some((med) => med.pillboxIndex === pillboxIndex);
          return isOccupied ? "red" : "empty"; // 데이터가 있으면 'red', 없으면 'empty'
        });

        setPillboxStatus(updatedStatus);
      } catch (error) {
        console.error("약 정보 가져오기 실패:", error);
      }
    };

    fetchData();
  }, [userId, pillboxStatus]); // userId가 변경될 때 데이터 다시 로드

  // 메뉴 열기/닫기
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <button className="icon-button" onClick={() => navigate("/login")}>
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo">Smart Pillbox</h1>
        <button className="icon-button" onClick={toggleMenu}>
          <MenuIcon className="icon" />
        </button>
      </header>

      {/* Slide-Out Menu */}
      {menuOpen && (
        <div className="menu">
          <h2>메뉴</h2>
          <ul className="menu-list">
            <li className="menu-item" onClick={() => navigate("/notification")}>
              ⚙️ 설정
            </li>
            <li className="menu-item" onClick={() => navigate("/history")}>
              🕒 복용 기록
            </li>
            <li className="menu-item">
              🔍 약 검색
            </li>
          </ul>

        </div>
      )}

      {/* Dashboard */}
      <main className="dashboard">
        <h2>오늘 먹어야 할 약</h2>
        <div className="dashboard-content">
          <ul className="pill-list">
            {pills.map((pill, index) => (
              <li key={index} className="pill-item">
                <div className="pill-info">
                  <PillIcon className="pill-icon" />
                  <span>{pill.name}</span>
                </div>
                <div className="pill-status">
                  <span
                    className={`status ${pill.status === "taken" ? "taken" : "missed"}`}
                  >
                    {pill.status === "taken" ? "✔️" : "❌"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Pillbox Status */}
      <div className="pillbox-grid">
        {pillboxStatus.map((status, index) => (
          <div
            key={index}
            className="pillbox-wrapper"
            onClick={() => goToRegisterPage(index)}
          >
            <div
              className={`status-light ${
                status === "red"
                  ? "red"
                  : status === "empty"
                  ? "gray"
                  : ""
              }`}
            ></div>
            <div className="pillbox">
              <img src={pillboxIcon} alt="Pillbox" className="pillbox-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
