import dotenv from "dotenv"; // 환경 변수 관리
import express from "express"; // Express.js
import { db } from "./lib/firebase.js"; // Firebase 초기화 코드
import cors from "cors";

dotenv.config(); // .env 파일 로드

const app = express(); // Express 애플리케이션 초기화
app.use(cors()); // CORS 설정
app.use(express.json()); // JSON 요청 파싱

// 약 등록 API
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
    });

    res.status(201).send({ message: "약 정보가 성공적으로 저장되었습니다!" });
  } catch (error) {
    console.error("Error saving medication:", error);
    res.status(500).send("약 정보를 저장하는 중에 오류가 발생했습니다.");
  }
});

// 약 목록 가져오기 API
app.get("/api/medications", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("사용자 ID가 필요합니다.");
  }

  try {
    const medsSnapshot = await db.collection(`users/${userId}/currentMeds`).get();
    if (medsSnapshot.empty) {
      console.log(`No medications found for userId: ${userId}`);
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

// 특정 약 정보 가져오기 API
app.get("/api/medication", async (req, res) => {
  const { userId, pillboxIndex } = req.query;

  if (!userId || !pillboxIndex) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    console.log(`Fetching pill for userId: ${userId}, pillboxIndex: ${pillboxIndex}`);
    
    const pillRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);
    const pillSnap = await pillRef.get();

    if (!pillSnap.exists) {
      console.log(`Pillbox_${pillboxIndex} not found for userId: ${userId}`);
      return res.status(404).send("약 정보를 찾을 수 없습니다.");
    }

    res.status(200).json({ id: pillSnap.id, ...pillSnap.data() });
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).send("약 정보를 가져오는 중 오류가 발생했습니다.");
  }
});

// 기본 서버 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 복용 완료 처리 API
app.post("/api/complete-medication", async (req, res) => {
  const { userId, pillboxIndex } = req.body;

  if (!userId || !pillboxIndex) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    // 현재 약 정보 가져오기
    const medRef = db
      .collection(`users/${userId}/currentMeds`)
      .doc(`pillbox_${pillboxIndex}`);
    const medSnap = await medRef.get();

    if (!medSnap.exists) {
      return res.status(404).send("해당 약 정보를 찾을 수 없습니다.");
    }

    const medication = medSnap.data();

    // 복용 완료 처리 - history로 이동
    const historyRef = db.collection(`users/${userId}/history`).doc();
    await historyRef.set({
      ...medication,
      completedAt: new Date().toISOString(), // 완료 시간 추가
    });

    // currentMeds에서 제거
    await medRef.delete();

    res.status(200).send({ message: "복용 완료 처리되었습니다." });
  } catch (error) {
    console.error("Error completing medication:", error);
    res.status(500).send("복용 완료 처리 중 오류가 발생했습니다.");
  }
});

// 복용 기록 가져오기 API
app.get("/api/history", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("사용자 ID가 필요합니다.");
  }

  try {
    const historySnapshot = await db.collection(`users/${userId}/history`).get();

    if (historySnapshot.empty) {
      console.log(`No history found for userId: ${userId}`);
      return res.status(404).send("복용 기록이 없습니다.");
    }

    const history = historySnapshot.docs.map((doc) => ({
      id: doc.id, // 문서 ID를 포함
      ...doc.data(),
    }));

    res.status(200).json(history);
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
