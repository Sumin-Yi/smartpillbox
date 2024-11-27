import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Firebase Auth 가져오기
import "./Information.css";

const Information = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pill, setPill] = useState(null); // 약 정보 상태
  const pillboxIndex = location.state?.pillboxIndex; // 넘겨받은 pillbox 번호
  const auth = getAuth(); // Firebase Auth 인스턴스

  useEffect(() => {
    const fetchPillData = async () => {
      try {
        const currentUser = auth.currentUser; // 현재 로그인된 사용자 가져오기
        if (!currentUser) {
          alert("로그인이 필요합니다.");
          navigate("/login"); // 로그인 페이지로 이동
          return;
        }

        const userId = currentUser.email; // 현재 사용자의 이메일을 userId로 사용

        const response = await fetch(
          `http://localhost:3000/api/medication?userId=${userId}&pillboxIndex=${pillboxIndex}`
        );

        if (!response.ok) {
          throw new Error("약 정보를 가져오는 데 실패했습니다.");
        }

        const data = await response.json();

        // Calculate additional fields
        const timesTaken = data.timesTaken || 0; // 총 복용 횟수 (기본값: 0)
        const frequency = data.frequency ? Number(data.frequency) : 0; // 총 복용해야 할 횟수
        const remaining = frequency - timesTaken; // 남은 횟수 계산
        const percentage = frequency > 0 ? (timesTaken / frequency) * 100 : 0; // 진행률 계산

        // Calculate the expected completion date
        const dailyDoses = [data.time.morning, data.time.lunch, data.time.evening].filter(Boolean).length; // Count the number of `true` values
        const remainingDays = dailyDoses > 0 ? Math.ceil(remaining / dailyDoses) : 0; // Calculate the remaining days and round up

        // Calculate the expected date by adding remainingDays to the current date
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + remainingDays); // Add remaining days to the current date
        const completionDate = currentDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"

        // Set pill data including calculated fields
        setPill({
          ...data,
          timesTaken,
          remaining,
          percentage,
          remainingDays, // Add the calculated remaining days to the pill data
          completionDate, // Add the calculated completion date
        });
      } catch (error) {
        console.error("Error fetching pill data:", error);
        alert("약 정보를 가져오는 중 오류가 발생했습니다.");
        navigate(-1); // 오류 발생 시 이전 페이지로 이동
      }
    };

    if (pillboxIndex) {
      fetchPillData(); // API 호출
    }
  }, [auth, pillboxIndex, navigate]);

  const handleComplete = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const userId = currentUser.email;

      const response = await fetch("http://localhost:3000/api/complete-medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pillboxIndex }),
      });

      if (!response.ok) {
        throw new Error("복용 완료 처리 중 오류가 발생했습니다.");
      }

      alert("복용 완료되었습니다!");
      navigate(-1); // 이전 페이지로 이동
    } catch (error) {
      console.error("Error completing medication:", error);
      alert("복용 완료 처리 중 오류가 발생했습니다.");
    }
  };

  if (!pill) {
    return <div>Loading...</div>; // 데이터를 불러오는 동안 표시
  }

  return (
    <div className="information-page">
      <header className="information-header">
        <button className="icon-button" onClick={() => navigate(-1)}>
          &lt; Back
        </button>
        <h1 className="logo">약 세부사항</h1>
      </header>
      <main className="content">
        <div className="pill-image-placeholder">
          <div className="pill-image"></div>
        </div>
        <h2>{pill.name}</h2>
        <p>
          <strong>예상 복용 완료일:</strong> {pill.completionDate.replace(/-/g, ".")} {/* Format as YYYY.MM.DD */}
        </p>
        <p>
          <strong>복용 방법:</strong> {pill.instructions || "-"}
        </p>
        <p>
          <strong>메모:</strong> {pill.note || "-"}
        </p>
        <p>
          <strong>총 복용 횟수:</strong> {pill.frequency || "-"}번
        </p>
        <p>
          <strong>복용 시간:</strong>{" "}
          {pill.time?.morning && "아침 "}
          {pill.time?.lunch && "점심 "}
          {pill.time?.evening && "저녁 "}
        </p>
        <p>
          <strong>남은 횟수:</strong> {pill.remaining || 0}번
        </p>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${pill.percentage || 0}%`,
              backgroundColor: "green",
            }}
          ></div>
        </div>
        <p className="progress-caption">
          ({pill.percentage || 0}% 복용 완료했어요!)
        </p>

        {/* 복용 완료 버튼 */}
        <button className="complete-button" onClick={handleComplete}>
          복용 완료하기
        </button>
      </main>
    </div>
  );
};

export default Information;
