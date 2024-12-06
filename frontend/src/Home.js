import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동 및 상태 관리
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase 인증
import { collection, query, limit, getDocs, updateDoc, doc, increment } from "firebase/firestore"; // Firestore 함수
import { db } from "./firebase"; // Firestore 초기화된 db 가져오기
import { ReactComponent as PillIcon } from "./icons/pill.svg";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as MenuIcon } from "./icons/menu.svg";
import { useRef } from "react";
import pillboxIcon from "./icons/pillbox.svg";
import "./Home.css";

const Home = () => {
  const [pills, setPills] = useState([]); // 대시보드에 표시할 약 데이터
  const [pillboxStatus, setPillboxStatus] = useState([
    "empty", // 1번 약통
    "empty", // 2번 약통
    "empty", // 3번 약통
    "empty", // 4번 약통
  ]);
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fetchNotificationsFromServer = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/notifications");
      if (response.ok) {
        const data = await response.json();

        if (data.notifications.length > 0) {
          // 새 알림이 있을 경우 상태 업데이트
          setNotifications(data.notifications);

          // 가장 첫 번째 알림을 팝업으로 표시
          setPopupMessage(data.notifications[0].message);
          setShowPopup(true);
        }
      } else {
        console.error("Failed to fetch notifications:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // 주기적으로 알림 조회
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationsFromServer();
    }, 1000); // 1초 간격

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, []);

  // 팝업 닫기
  const closePopup = () => {
    setShowPopup(false);
  };

  const previousPillboxStatus = useRef(pillboxStatus); // 이전 상태를 추적
  const [lastUpdated, setLastUpdated] = useState(0); // 서버에서 가져온 최신 타임스탬프

  // 서버에서 상태 가져오기
  const fetchPillboxStatusFromServer = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/status");
      if (response.ok) {
        const data = await response.json();
  
        // 상태가 변경되었을 경우만 로컬 상태 업데이트
        if (data.lastUpdated > lastUpdated) {
          const updatedStatus = data.status;
          setPillboxStatus(updatedStatus);
          setLastUpdated(data.lastUpdated);
  
          // DB 업데이트 로직 추가
          await updatePillboxStatusInDb(updatedStatus);
        }
      } else {
        console.error("Failed to fetch status from server:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching status from server:", error);
    }
  };
  
  // Firestore에서 pillboxStatus를 업데이트
  const updatePillboxStatusInDb = async (updatedStatus) => {
    if (!userId) return; // 로그인 상태 확인
  
    try {
      const promises = updatedStatus.map(async (status, index) => {
        // pillbox index는 1부터 시작
        const pillboxIndex = index + 1;
  
        // 해당 약통에 연결된 Firestore 문서 참조
        const pillRef = doc(db, `users/${userId}/currentMeds`, `pillbox_${pillboxIndex}`);
  
        if (status === "green") {
          // 상태가 green이면 isConsumed를 true로 업데이트
          await updateDoc(pillRef, { isConsumed: true });
        } else if (status === "red") {
          // 상태가 red이면 isConsumed를 false로 업데이트
          await updateDoc(pillRef, { isConsumed: false });
        }
      });
  
      // 모든 업데이트 작업 완료를 기다림
      await Promise.all(promises);
      console.log("Pillbox status updated in Firestore successfully.");
    } catch (error) {
      console.error("Error updating pillbox status in Firestore:", error);
    }
  };
  

  // 상태를 주기적으로 확인 (0.1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPillboxStatusFromServer();
    }, 100); // 0.1초

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [lastUpdated]); // 타임스탬프에 의존

  const sendPillboxStatusToServer = async (updatedStatus) => {
    try {
      const response = await fetch("http://localhost:3000/api/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pillboxStatus: updatedStatus }),
      });

      if (response.ok) {
        console.log("Status updated successfully:", await response.json());
      } else {
        console.error("Failed to update status:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending status to server:", error);
    }
  };

  // pillboxStatus가 변경될 때 상태 비교 후 서버로 전송
  useEffect(() => {
    if (
      JSON.stringify(previousPillboxStatus.current) !==
      JSON.stringify(pillboxStatus)
    ) {
      sendPillboxStatusToServer(pillboxStatus);
      previousPillboxStatus.current = pillboxStatus; // 이전 상태 업데이트
    }
  }, [pillboxStatus]);

  const [userId, setUserId] = useState(null); // 로그인된 사용자 ID 상태
  const [menuOpen, setMenuOpen] = useState(false); // 메뉴 상태
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

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

  // Firestore에서 약 데이터를 가져오기 (쿼리 제한 적용)
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return; // 로그인되지 않은 상태에서는 데이터를 가져오지 않음

      try {
        // Firestore에서 약 데이터 쿼리
        const q = query(collection(db, `users/${userId}/currentMeds`), limit(4));
        const querySnapshot = await getDocs(q);

        const medications = [];
        const newPillboxStatus = Array(4).fill("empty"); // 새로운 약통 상태

        // Firestore 쿼리 결과 처리
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          medications.push({
            name: data.name, // 약 이름
            status: data.isConsumed ? "taken" : "pending", // 복용 여부에 따라 상태 설정
            pillboxIndex: data.pillboxIndex, // 약통 번호
          });

          // 새 약 정보에 따라 약통 상태를 업데이트
          newPillboxStatus[data.pillboxIndex - 1] = data.isConsumed
            ? "green"
            : "red";
        });

        // 약통 번호 기준으로 정렬
        medications.sort((a, b) => a.pillboxIndex - b.pillboxIndex);

        // 상태 업데이트 (변경 사항이 있을 경우에만)
        if (JSON.stringify(medications) !== JSON.stringify(pills)) {
          setPills(medications);
        }
        if (JSON.stringify(newPillboxStatus) !== JSON.stringify(pillboxStatus)) {
          setPillboxStatus(newPillboxStatus);
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    fetchData();
  }, [userId]); // userId로만 데이터 로드 트리거



  // Register 페이지로 약통 번호와 함께 이동
  const goToRegisterPage = (index) => {
    if (pillboxStatus[index] === "empty") {
      navigate("/register", { state: { pillboxIndex: index + 1 } }); // 약통 번호 전달
    } else {
      navigate("/information", { state: { pillboxIndex: index + 1 } }); // 약 정보는 넘기지 않음
    }
  };

  // 약 복용 상태 업데이트
  const togglePillStatus = async (index) => {
    if (!isEditing) return;

    const updatedPills = [...pills];
    const pill = updatedPills[index];
    const pillboxIndex = pill.pillboxIndex - 1;

    // Toggle pill status
    const newStatus = pill.status === "taken" ? "pending" : "taken";
    pill.status = newStatus;

    try {
      // Reference to the Firestore document
      const pillRef = doc(
        db,
        `users/${userId}/currentMeds`,
        `pillbox_${pill.pillboxIndex}`
      );

      // If toggled to "taken", set isConsumed to true and increment timesTaken
      if (newStatus === "taken") {
        await updateDoc(pillRef, {
          isConsumed: true,
          timesTaken: increment(1), // Use Firestore's increment function
        });
      } else {
        // If toggled to "pending", set isConsumed to false
        await updateDoc(pillRef, {
          isConsumed: false,
          timesTaken: increment(-1)
        });
      }

      // Update the pillbox status locally
      const updatedStatus = [...pillboxStatus];
      updatedStatus[pillboxIndex] = newStatus === "taken" ? "green" : "red";

      setPills(updatedPills); // Update pills in state
      setPillboxStatus(updatedStatus); // Update pillbox status
    } catch (error) {
      console.error("Error updating pill status:", error);
    }
  };

  // 메뉴 열기/닫기
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 수정 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
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
      {/* 알림 팝업 */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={closePopup}>닫기</button>
          </div>
        </div>
      )}

      {/* Slide-Out Menu */}
      {menuOpen && (
        <>
          <div className="overlay" onClick={toggleMenu}></div> {/* 배경 */}
          <div className={`menu ${menuOpen ? "open" : "close"}`}>
            <h2>메뉴</h2>
            <ul className="menu-list">
              <li className="menu-item" onClick={() => navigate("/notification")}>
                ⚙️ 알림 설정
              </li>
              <li className="menu-item" onClick={() => navigate("/history")}>
                🕒 복용 기록
              </li>
            </ul>
          </div>
        </>
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
                    className={`status ${
                      pill.status === "taken" ? "taken" : "missed"
                    }`}
                    onClick={() => isEditing && togglePillStatus(index)} // 수정 모드에서만 상태 토글
                  >
                    {pill.status === "taken" ? "✔️" : "❌"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <button className="edit-button" onClick={toggleEditMode}>
            {isEditing ? "완료" : "수정"} {/* Edit or Complete */}
          </button>
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
                  : status === "green"
                  ? "green"
                  : status === "blue"
                  ? "blue"
                  : "gray"
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
