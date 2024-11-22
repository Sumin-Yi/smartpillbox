import dotenv from "dotenv"; // 환경 변수 관리
import express from "express"; // Express.js
import { db } from "./lib/firebase.js"; // Firebase 초기화 코드

dotenv.config(); // .env 파일 로드

const app = express();
app.use(express.json()); // JSON 요청 파싱

// 약 등록 API
app.post("/api/medications", async (req, res) => {
  const { userId, medicineName, times, dosage, memo } = req.body;

  if (!userId || !medicineName || !dosage) {
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  try {
    // Firestore에 저장
    const medRef = db.collection(`users/${userId}/currentMeds`).doc();
    await medRef.set({
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

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
