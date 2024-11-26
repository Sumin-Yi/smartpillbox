import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 페이지 이동 및 상태 관리
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

  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation(); // 다른 페이지에서 전달된 상태 확인

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
      try {
        const response = await fetch("http://localhost:3000/api/medications?userId=test1@gmail.com");
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
  }, []);

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <button className="icon-button" onClick={() => navigate("/login")}>
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo">Smart Pillbox</h1>
        <button className="icon-button">
          <MenuIcon className="icon" />
        </button>
      </header>

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
