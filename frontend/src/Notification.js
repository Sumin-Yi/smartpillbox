import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { ReactComponent as ProfileIcon } from "./icons/profile.svg";
import { ReactComponent as MenuIcon } from "./icons/menu.svg";
import "./Notification.css";

const Notification = () => {
  const [isEnabled, setIsEnabled] = useState(false); // Toggle state
  const [selectedTime, setSelectedTime] = useState(""); // Default notification time
  const [userId, setUserId] = useState(null); // Logged-in user ID
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Menu state

  // Firebase Auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.email); // Set user email as userId
      } else {
        navigate("/login"); // Redirect to login if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch Notification Settings when the component loads or userId changes
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (userId) {
        try {
          const userRef = doc(db, "users", userId, "NotificationSettings", "NotificationSettings");
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setIsEnabled(data.isEnabled || false); // Set toggle state
            setSelectedTime(data["notification-time"] || "30분 전"); // Set dropdown value
          } else {
            console.log("No notification settings found. Initializing default values...");
            await updateDoc(userRef, {
              isEnabled: false,
              "notification-time": "30분 전", // Default value
            });
          }
        } catch (error) {
          console.error("Error fetching notification settings:", error);
        }
      }
    };

    fetchNotificationSettings();
  }, [userId]);

  // Handle toggle changes and update Firestore
  const handleToggle = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
  
    if (userId) {
      try {
        await fetch("http://localhost:3000/api/notification-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            isEnabled: newState,
            notificationTime: newState ? selectedTime : null,
          }),
        });
  
        console.log("Notification settings updated:", { isEnabled: newState });
      } catch (error) {
        console.error("Error updating notifications:", error);
      }
    }
  };
  

  // Handle dropdown selection changes and update Firestore
  const handleDropdownChange = async (event) => {
    const newTime = event.target.value;
    setSelectedTime(newTime);
  
    if (userId && isEnabled) {
      try {
        await fetch("http://localhost:3000/api/notification-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            isEnabled: true,
            notificationTime: newTime,
          }),
        });
  
        console.log("Notification time updated:", newTime);
      } catch (error) {
        console.error("Error updating notification time:", error);
      }
    }
  };
  

  const goToHomePage = () => {
    navigate("/"); // Go to home page
  };

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="notification-page">
      {/* Header */}
      <header className="header">
        <button className="icon-button" onClick={() => navigate("/profile")}>
          <ProfileIcon className="icon" />
        </button>
        <h1 className="logo" onClick={goToHomePage}>
          Smart Pillbox
        </h1>
        <button className="icon-button" onClick={toggleMenu}>
          <MenuIcon className="icon" />
        </button>
      </header>

      {/* Slide-Out Menu */}
      {menuOpen && (
        <div className="menu">
          <h2>메뉴</h2>
          <ul className="menu-list">
            <li className="menu-item" onClick={() => navigate("/history")}>
              🕒 복용 기록
            </li>
            <li className="menu-item">🔍 약 검색</li>
          </ul>
        </div>
      )}

      <h2 className="page-title">알림 설정</h2>

      {/* Content */}
      <div className="content">
        <div className="notification-setting">
          <span className="setting-label">복용 알림 설정을 받을래요.</span>
          <label className="switch">
            <input type="checkbox" checked={isEnabled} onChange={handleToggle} />
            <span className="slider" />
          </label>
        </div>

        {isEnabled && (
          <div className="dropdown-container">
            <label className="dropdown-label" htmlFor="notification-time">
              알림을 언제 받으시겠어요?
            </label>
            <select
              id="notification-time"
              className="dropdown"
              value={selectedTime}
              onChange={handleDropdownChange}
            >
              <option value="30분 전">30분 전</option>
              <option value="1시간 전">1시간 전</option>
              <option value="2시간 전">2시간 전</option>
              <option value="3시간 전">3시간 전</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
