import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅
import { auth } from "./firebase"; // Firebase 초기화된 auth 가져오기
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"; // Firebase 인증
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as MenuIcon } from './icons/menu.svg';
import './Login.css'; // 스타일 파일

const Login = () => {
  const navigate = useNavigate(); // useNavigate 훅

  // 상태 관리
  const [email, setEmail] = useState(""); // 이메일
  const [password, setPassword] = useState(""); // 비밀번호
  const [error, setError] = useState(null); // 오류 메시지
  const [user, setUser] = useState(null); // 현재 로그인한 사용자

  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; // Cleanup listener on component unmount
  }, []);

  const handleLogin = async () => {
    try {
      // Firebase 이메일/비밀번호 로그인
      await signInWithEmailAndPassword(auth, email, password);
      alert("로그인 성공!");
      navigate("/"); // 로그인 성공 시 홈 화면으로 이동
    } catch (error) {
      console.error(error);
      setError("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 성공!");
      setUser(null); // Reset user state
    } catch (error) {
      console.error(error);
      setError("로그아웃에 실패했습니다.");
    }
  };

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

      {/* Main Content */}
      <main className="login-main">
        <h2>{user ? "환영합니다!" : "로그인"}</h2>

        {user ? (
          <div className="logged-in">
            <p>
              {user.email}님, 환영합니다!
            </p>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="login-form">
            {/* Profile Icon */}
            <div className="profile-icon-wrapper">
              <ProfileIcon className="profile-icon" />
            </div>

            {/* Input Fields */}
            <div className="input-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button className="login-button" onClick={handleLogin}>
              로그인
            </button>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Additional Options */}
            <div className="login-options">
              <a href="/register">회원가입</a>
              <span>|</span>
              <a href="/find-id">아이디 찾기</a>
              <span>|</span>
              <a href="/find-password">비밀번호 찾기</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
