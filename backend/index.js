const express = require("express");
const app = express();
const PORT = 5000;

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Backend 서버가 정상적으로 작동 중입니다!");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
