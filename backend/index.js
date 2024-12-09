import dotenv from "dotenv"; // 환경 변수 관리
import express from "express"; // Express.js
import { db } from "./lib/firebase.js"; // Firebase 초기화 코드
import cors from "cors"; // CORS 설정
import bodyParser from 'body-parser';


dotenv.config(); // .env 파일 로드

const app = express(); // Express 애플리케이션 초기화
app.use(cors()); // CORS 설정
app.use(express.json()); // JSON 요청 파싱

/**
 * 약 등록 API
 * 사용자가 새로운 약을 등록할 때 호출되는 API
 */
app.post("/api/medications", async (req, res) => {
  const { userId, pillboxIndex, medicineName, times, dosage, memo } = req.body;

  if (!userId || !pillboxIndex || !medicineName || !dosage) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const medRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);

    await medRef.set({
      pillboxIndex,
      name: medicineName,
      time: times,
      frequency: dosage,
      note: memo,
      createdAt: new Date().toISOString(),
      isConsumed: false, // 복용 여부 초기화
      timesTaken: 0, // 복용 횟수 초기화
    });

    res.status(201).send({ message: "약 정보가 성공적으로 저장되었습니다!" });
  } catch (error) {
    console.error("Error saving medication:", error);
    res.status(500).send("약 정보를 저장하는 중에 오류가 발생했습니다.");
  }
});

/**
 * 특정 약 정보 가져오기 API
 * 특정 약통(pillbox)에 저장된 약 정보를 반환
 */
app.get("/api/medication", async (req, res) => {
  const { userId, pillboxIndex } = req.query;

  if (!userId || !pillboxIndex) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const pillRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);
    const pillSnap = await pillRef.get();

    if (!pillSnap.exists) {
      return res.status(404).send("약 정보를 찾을 수 없습니다.");
    }

    res.status(200).json({ id: pillSnap.id, ...pillSnap.data() });
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).send("약 정보를 가져오는 중 오류가 발생했습니다.");
  }
});


/**
 * 복용 완료 처리 API
 * 사용자가 약을 복용 완료했을 때 호출되는 API
 */
// TODO(동훈): status를 "complete"로 바꾸기
app.post("/api/complete-medication", async (req, res) => {
  const { userId, pillboxIndex } = req.body;

  if (!userId || !pillboxIndex) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const medRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);
    const medSnap = await medRef.get();

    if (!medSnap.exists) {
      return res.status(404).send("해당 약 정보를 찾을 수 없습니다.");
    }

    const medication = medSnap.data();

    // `timesTaken` 값을 증가
    const updatedTimesTaken = (medication.timesTaken || 0) + 1;

    // 고유한 문서 이름 생성 (예: UUID 또는 현재 타임스탬프)
    const uniqueDocId = `pillbox_${pillboxIndex}_${new Date().getTime()}`;
    
    // Adjust date to KST (UTC+9)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
    const kst = new Date(utc + 9 * 3600000); // Add 9 hours for KST

    // Format the date as "YYYY-MM-DD"
    const formattedDate = `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, '0')}-${String(kst.getDate()).padStart(2, '0')}`;
    
    // `history` 컬렉션에 데이터 추가
    const historyRef = db.collection(`users/${userId}/history`).doc(uniqueDocId);
    await historyRef.set({
      ...medication,
      timesTaken: updatedTimesTaken, // 복용 횟수 업데이트
      consumedAt: formattedDate, // 복용 완료 날짜 기록 (KST)
    });

    // `currentMeds` 컬렉션에서 데이터 삭제
    await medRef.delete();

    status[pillboxIndex-1] = "complete"; //하드웨어로 복용완료 정보 전송

    res.status(200).send({
      message: "복용 완료 처리되었습니다. 기록이 history로 이동되었습니다.",
      timesTaken: updatedTimesTaken,
    });
  } catch (error) {
    console.error("Error completing medication:", error);
    res.status(500).send("복용 완료 처리 중 오류가 발생했습니다.");
  }
});



app.get("/api/history", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("userId가 누락되었습니다.");
  }

  try {
    // Firestore에서 history 컬렉션 데이터 가져오기
    const historyRef = db.collection(`users/${userId}/history`);
    const snapshot = await historyRef.get();

    if (snapshot.empty) {
      return res.status(404).send("복용 기록이 없습니다.");
    }

    const historyData = snapshot.docs.map(doc => ({
      id: doc.id, // 문서 ID
      ...doc.data(), // 문서 데이터
    }));

    res.status(200).json(historyData); // 복용 기록 반환
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).send("복용 기록을 가져오는 중 오류가 발생했습니다.");
  }
});

// 특정 복용 기록 약 정보 가져오기 API
app.get("/api/history-medication", async (req, res) => {
  const { userId, pillId } = req.query;

  if (!userId || !pillId) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const pillRef = db.collection(`users/${userId}/history`).doc(pillId);
    const pillSnap = await pillRef.get();

    if (!pillSnap.exists) {
      console.log(`Pill with ID ${pillId} not found for userId: ${userId}`);
      return res.status(404).send("약 정보를 찾을 수 없습니다.");
    }

    res.status(200).json({ id: pillSnap.id, ...pillSnap.data() });
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).send("약 정보를 가져오는 중 오류가 발생했습니다.");
  }
});


/**
 * 약 목록 가져오기 API
 * 현재 등록된 약 목록을 반환하는 API
 */
app.get("/api/medications", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("사용자 ID가 필요합니다.");
  }

  try {
    const medsSnapshot = await db.collection(`users/${userId}/currentMeds`).get();

    if (medsSnapshot.empty) {
      return res.status(404).send("약 목록이 비어 있습니다.");
    }

    const medications = medsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      pillboxIndex: Number(doc.data().pillboxIndex),
    }));

    res.status(200).json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).send("약 정보를 가져오는 중 오류가 발생했습니다.");
  }
});

/**
 * 복용 여부 초기화 API
 * 사용자가 복용해야 할 다음 시간에 isConsumed를 false로 업데이트
 */
app.post("/api/reset-consumption", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send("사용자 ID가 필요합니다.");
  }

  try {
    const medsSnapshot = await db.collection(`users/${userId}/currentMeds`).get();

    if (medsSnapshot.empty) {
      return res.status(404).send("약 목록이 비어 있습니다.");
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    medsSnapshot.forEach(async (doc) => {
      const medication = doc.data();
      const timeFields = medication.time || {};

      // Reset isConsumed based on the next scheduled time
      if (timeFields.morning && currentHour >= 8 && currentHour < 12) {
        await doc.ref.update({ isConsumed: false });
      } else if (timeFields.lunch && currentHour >= 12 && currentHour < 18) {
        await doc.ref.update({ isConsumed: false });
      } else if (timeFields.evening && currentHour >= 18 && currentHour < 24) {
        await doc.ref.update({ isConsumed: false });
      }
    });

    res.status(200).send({ message: "복용 상태 초기화 완료!" });
  } catch (error) {
    console.error("Error resetting consumption:", error);
    res.status(500).send("복용 상태 초기화 중 오류가 발생했습니다.");
  }
});

/**
 * 복용 횟수 변경 API
 * 사용자 대시보드에서 수동으로 복용 상태를 변경할 때 호출되는 API
 */
app.post("/api/update-times-taken", async (req, res) => {
  const { userId, pillboxIndex, change } = req.body;

  if (!userId || !pillboxIndex || !change) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    const medRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);
    const medSnap = await medRef.get();

    if (!medSnap.exists) {
      return res.status(404).send("해당 약 정보를 찾을 수 없습니다.");
    }

    const medication = medSnap.data();

    // Update timesTaken based on the `change` parameter
    let updatedTimesTaken = medication.timesTaken || 0;
    if (change === "increment") {
      updatedTimesTaken += 1;
    } else if (change === "decrement" && updatedTimesTaken > 0) {
      updatedTimesTaken -= 1; // Prevent negative values
    } else {
      return res
        .status(400)
        .send("Invalid change parameter or timesTaken is already zero.");
    }

    await medRef.update({
      timesTaken: updatedTimesTaken,
      isConsumed: change === "increment", // Set isConsumed based on action
    });

    res.status(200).send({
      message: `복용 횟수 ${change} 처리되었습니다.`,
      timesTaken: updatedTimesTaken,
    });
  } catch (error) {
    console.error("Error updating timesTaken:", error);
    res.status(500).send("복용 상태 업데이트 중 오류가 발생했습니다.");
  }
});


/**
 * 알림 설정 저장 API
 */
app.post("/api/notification-settings", async (req, res) => {
  const { userId, isEnabled, notificationTime } = req.body;

  if (!userId) {
    return res.status(400).send("User ID is required.");
  }

  try {
    // Firestore 경로 수정
    const userRef = db.collection(`users/${userId}/NotificationSettings`).doc("NotificationSettings");

    // Update the settings in the NotificationSettings subcollection
    await userRef.set(
      {
        isEnabled,
        "notification-time": isEnabled ? notificationTime : null, // Reset time to null if notifications are disabled
      },
      { merge: true } // Ensure only these fields are updated
    );

    res.status(200).send({ message: "Notification settings updated successfully!" });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).send("Failed to update notification settings.");
  }
});


let status = ["empty", "empty", "empty", "empty"];
let lastUpdated = Date.now(); // 상태가 마지막으로 변경된 시간

// 상태 업데이트 API (하드웨어에서 사용)
app.post("/api/hardware/update", (req, res) => {
  const { pillboxIndex, newStatus } = req.body;

  // 유효성 검사
  if (
    typeof pillboxIndex !== "number" ||
    pillboxIndex < 1 ||
    pillboxIndex > 4 ||
    !["empty", "green", "red"].includes(newStatus)
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // 상태 변경 및 타임스탬프 갱신
  status[pillboxIndex - 1] = newStatus;
  lastUpdated = Date.now();
  console.log(`Status updated by hardware: ${status}`);

  res.json({ message: "Status updated successfully", status });
});

// 상태 조회 API (클라이언트에서 사용)
app.get("/api/status", (req, res) => {
  res.json({ status, lastUpdated });
});

// 상태 업데이트 API
app.post("/api/updateStatus", (req, res) => {
  const { pillboxStatus } = req.body;

  // 유효성 검사
  if (!Array.isArray(pillboxStatus) || pillboxStatus.length !== 4) {
    return res.status(400).json({ error: "Invalid status array" });
  }

  // 상태 업데이트
  status = pillboxStatus;
  console.log("Updated status:", status);

  // 응답
  res.json({ message: "Status updated successfully", status });
});

// 하드웨어 업데이트
app.post("/api/hardware/update", async (req, res) => {
  const { pillboxIndex, newStatus } = req.body;

  // 유효성 검사
  if (
    typeof pillboxIndex !== "number" ||
    pillboxIndex < 1 ||
    pillboxIndex > 4 ||
    !["empty", "green", "red"].includes(newStatus)
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // 상태 업데이트
  status[pillboxIndex - 1] = newStatus;
  console.log(`Updated status (from hardware): ${status}`);

  res.json({ message: "Status updated successfully", status });
});

let notifications = []; // 알림 저장소
app.post("/api/notifications", async (req, res) => {
  const { message} = req.body;

  // 유효성 검사
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid notification data" });
  }

  // 알림 추가
  notifications.push({ message});
  console.log(`New notification: ${message}`);

  res.json({ message: "Notification received successfully" });
});

// 알림 조회 API (클라이언트에서 사용)
app.get("/api/notifications", async (req, res) => {
  res.json({ notifications });

  // 알림 전달 후 초기화 (단일 클라이언트 기준)
  notifications = [];
});


// 기본 서버 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get("/ping", (req, res) => {
  console.log("Received ping from Arduino");
  res.send("pong"); // Respond with "pong"
});

// Route to handle Arduino data
app.get("/api/hardware/change-state", (req, res) => {
  console.log("Data received from Arduino:", req.body);

  // Respond back to Arduino
  res.json({ state: status });
});