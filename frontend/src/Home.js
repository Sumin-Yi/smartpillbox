import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅
import { ReactComponent as PillIcon } from './icons/pill.svg';
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as MenuIcon } from './icons/menu.svg';
import pillboxIcon from './icons/pillbox.svg'; 
import './Home.css';

const Home = () => {
  const [pills, setPills] = useState([
    { name: 'Medicine A', status: 'taken' },
    { name: 'Medicine B', status: 'pending' },
    { name: 'Medicine C', status: 'missed' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [pillboxStatus, setPillboxStatus] = useState([
    'taken', 
    'taken', 
    'taken', 
    'taken'   
  ]);

  const navigate = useNavigate(); // useNavigate 훅

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const toggleStatus = (index) => {
    if (!isEditing) return;
    setPills((prevPills) =>
      prevPills.map((pill, i) =>
        i === index ? { ...pill, status: pill.status === 'taken' ? 'missed' : 'taken' } : pill
      )
    );
  };

  const goToRegisterPage = () => {
    navigate('/register'); // 이동할 경로
  };

  const goToLoginPage = () => {
    navigate('/login'); // 로그인 페이지로 이동
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 상태 관리

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // 메뉴 열고 닫기
  };

  const goToInformationPage = (index) => {
    navigate('/information', { state: { pillIndex: index } }); // 선택한 약통의 index 전달
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <button className="icon-button" onClick={goToLoginPage}>
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo">Smart Pillbox</h1>
        <button className="icon-button" onClick={toggleMenu}>
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
                    className={`status ${pill.status === 'taken' ? 'taken' : 'missed'}`}
                    onClick={() => toggleStatus(index)}
                  >
                    {pill.status === 'taken' ? '✔️' : '❌'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <button className="edit-button" onClick={toggleEditMode}>
            {isEditing ? 'Complete' : 'Edit'}
          </button>
        </div>
      </main>

      {/* Menu */}
      {isMenuOpen && (
        <div className="menu">
          <h2 className="menu-title">메뉴</h2>
          <ul className="menu-list">
            <li className="menu-item" onClick={() => navigate('/settings')}>
              설정
            </li>
            <li className="menu-item" onClick={() => navigate('/history')}>
              복용 기록
            </li>
            <li className="menu-item" onClick={() => navigate('/search')}>
              약 검색
            </li>
          </ul>
        </div>
      )}

      {/* Pillbox Status */}
      <div className="pillbox-grid">
        {pillboxStatus.map((status, index) => (
            <div
              key={index}
              className="pillbox-wrapper"
              onClick={() => goToInformationPage(index)} // 약통 클릭 이벤트
            >
            <div className={`status-light ${status === 'taken' ? 'green' : 'red'}`}></div>
            <div className="pillbox">
              <img src={pillboxIcon} alt="Pillbox" className="pillbox-icon" />
            </div>
          </div>
        ))}
      </div>

      {/* Add pill */}
      <button className="AddPill" onClick={goToRegisterPage}>+</button>
    </div>
  );
};

export default Home;
