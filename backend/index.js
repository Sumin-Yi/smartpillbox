import dotenv from "dotenv"; // 환경 변수 관리
import express from "express"; // Express.js
import { db } from "./lib/firebase.js"; // Firebase 초기화 코드
import cors from "cors"; // CORS 설정

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

    // `timesTaken` 값을 증가시키고 `isConsumed` 상태를 true로 설정
    const updatedTimesTaken = (medication.timesTaken || 0) + 1;

    // `history` 컬렉션에 데이터 추가
    const historyRef = db.collection(`users/${userId}/history`).doc(`pillbox_${pillboxIndex}`);
    await historyRef.set({
      ...medication,
      timesTaken: updatedTimesTaken, // 복용 횟수 업데이트
      consumedAt: new Date().toISOString(), // 복용 완료 시간 기록
    });

    // `currentMeds` 컬렉션에서 데이터 삭제
    await medRef.delete();

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
 * 복용 횟수 증가 API
 * 사용자 대시보드에서 수동으로 복용 상태를 변경할 때 호출되는 API
 */
app.post("/api/increment-times-taken", async (req, res) => {
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

    const updatedTimesTaken = (medication.timesTaken || 0) + 1;

    await medRef.update({
      timesTaken: updatedTimesTaken,
    });

    res.status(200).send({ timesTaken: updatedTimesTaken });
  } catch (error) {
    console.error("Error incrementing timesTaken:", error);
    res.status(500).send("복용 횟수 증가 중 오류가 발생했습니다.");
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



// 기본 서버 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
