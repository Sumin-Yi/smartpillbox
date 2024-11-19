import React from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as MenuIcon } from './icons/menu.svg';
import './Login.css'; // 스타일 파일

const Login = () => {
  const navigate = useNavigate(); // useNavigate 훅

  const goToHomePage = () => {
    navigate('/'); // 홈 화면으로 이동
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="header">
        <button className="icon-button">
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo" onClick={goToHomePage}>
          Smart Pillbox
        </h1>
        <button className="icon-button">
          <MenuIcon className="icon" />
        </button>
      </header>

      {/* Login Form */}
      <main className="login-main">
        <h2>로그인</h2>
        <div className="login-form">
          {/* Profile Icon */}
          <div className="profile-icon-wrapper">
            <ProfileIcon className="profile-icon" />
          </div>

          {/* Input Fields */}
          <div className="input-group">
            <label htmlFor="id">ID</label>
            <input type="text" id="id" placeholder="Enter your ID" />
          </div>
          <div className="input-group">
            <label htmlFor="password">PW</label>
            <input type="password" id="password" placeholder="Enter your password" />
          </div>

          {/* Submit Button */}
          <button className="login-button">다음</button>

          {/* Additional Options */}
          <div className="login-options">
            <a href="/register">회원가입</a>
            <span>|</span>
            <a href="/find-id">아이디 찾기</a>
            <span>|</span>
            <a href="/find-password">비밀번호 찾기</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
